package mk.ukim.finki.mojgrad.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.ClassificationResultDTO;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintTrackingResponse;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import mk.ukim.finki.mojgrad.mapper.MyCityExtensions;
import mk.ukim.finki.mojgrad.repository.ComplaintRepository;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.ComplaintService;
import mk.ukim.finki.mojgrad.service.specifications.ComplaintSpecification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final WebClient client;

    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            WebClient.Builder builder,
            @Value("${AI_API_KEY}") String apiKey) {
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.client = builder
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/openai/")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public ComplaintTrackingResponse create(ComplaintRequest request) {
        List<Department> departments = departmentRepository.findAll();

        ClassificationResultDTO result = classifyComplaint(request.title(), request.description(), departments);

        Department department = departments.stream()
                .filter(d -> d.getName().equals(result.departmentName()))
                .findFirst()
                .orElse(departments.isEmpty() ? null : departments.get(0));

        Complaint complaint = new Complaint();
        complaint.setTitle(request.title());
        complaint.setTrackingToken(generateTrackingToken());
        complaint.setDescription(request.description());
        complaint.setLatitude(request.latitude());
        complaint.setLongitude(request.longitude());
        complaint.setPriority(result.priority());
        complaint.setPhoto(request.photo());
        complaint.setDepartment(department);
        complaint.setComplaintStatus(ComplaintStatus.PENDING);

        return MyCityExtensions.complaintToTrackingResponse(complaintRepository.save(complaint));
    }

    private ClassificationResultDTO classifyComplaint(String title, String description, List<Department> departments) {
        try {
            String departmentNames = departments.stream()
                    .map(Department::getName)
                    .collect(Collectors.joining(", "));

            String systemPrompt = """
                    You are a complaint classifier for a city management system.
                    Given a complaint title and description, classify both its priority and the responsible department.
                    Respond ONLY with a JSON object like:
                    {"priority": "HIGH", "department": "DepartmentName"}
                    Priority must be one of: LOW, MEDIUM, HIGH
                    Rules for priority:
                    - HIGH: significant infrastructure issues
                    - MEDIUM: moderate issues
                    - LOW: minor issues
                    The department name must be EXACTLY one of the provided departments.
                    No explanation, no markdown, just the JSON.
                    """;

            String userPrompt = "Title: " + title
                    + "\nDescription: " + description
                    + "\nAvailable departments: " + departmentNames;

            String rawResponse = client.post()
                    .uri("chat/completions")
                    .bodyValue(Map.of(
                            "model", "gemini-2.5-flash-lite",
                            "messages", List.of(
                                    Map.of("role", "system", "content", systemPrompt),
                                    Map.of("role", "user", "content", userPrompt)
                            )
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(rawResponse);
            String content = root.path("choices").get(0).path("message").path("content").asText().trim();
            content = content.replaceAll("(?s)```(?:json)?\\s*", "").trim();
            JsonNode resultNode = mapper.readTree(content);

            Priority priority = Priority.valueOf(resultNode.path("priority").asText("MEDIUM"));
            String departmentName = resultNode.path("department").asText();

            return new ClassificationResultDTO(priority, departmentName);

        } catch (Exception e) {
            String fallbackDepartment = departments.isEmpty() ? "" : departments.get(0).getName();
            return new ClassificationResultDTO(Priority.MEDIUM, fallbackDepartment);
        }
    }

    @Override
    public ComplaintResponse findById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Жалбата не е пронајдена!"));
        return MyCityExtensions.complaintToResponse(complaint);
    }

    @Override
    public ComplaintResponse findByToken(String token) {
        return MyCityExtensions.complaintToResponse(complaintRepository.findByTrackingToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Невалиден токен!")));
    }

    @Override
    public List<ComplaintResponse> findAll() {
        return complaintRepository.findAll()
                .stream()
                .map(MyCityExtensions::complaintToResponse)
                .toList();
    }

    private String generateTrackingToken() {
        String token;

        do {
            token = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        } while (complaintRepository.existsByTrackingToken(token));

        return token;
    }

    @Override
    public Page<ComplaintResponse> findAllByDepartment(ComplaintFilterRequest filter, Pageable pageable, Authentication authentication) {
        String email = ((User) authentication.getPrincipal()).getEmail();
        User worker = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));
        Department department = worker.getDepartment();
        return complaintRepository.findAll(ComplaintSpecification.filter(filter, department), pageable)
                .map(MyCityExtensions::complaintToResponse);
    }

    //Update complaint department
    @Override
    public void updateDepartment(Long complaintId, Long departmentId) {
        //Validate complaint exists
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Жалбата не е пронајдена!"));
        //Validate department exists
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Одделот не е пронајден!"));

        complaint.setDepartment(department);

        complaintRepository.save(complaint);
    }

    //Update status
    @Override
    public void updateStatus(Long id, ComplaintStatus status, Authentication authentication) {
        //Validate complaint exists
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Жалбата не е пронајдена!"));
        //Check department ownership
        User worker = (User) authentication.getPrincipal();
        Department workerDepartment = worker.getDepartment();

        if (!complaint.getDepartment().getId().equals(workerDepartment.getId())) {
            throw new ResourceNotFoundException("Немате пристап до оваа жалба!");
        }

        complaint.setComplaintStatus(status);

        complaintRepository.save(complaint);
    }
    //Update priority
    @Override
    public void updatePriority(Long id, Priority priority, Authentication authentication) {
        //Validate complaint exists
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Жалбата не е пронајдена!"));
        //Check department ownership
        User worker = (User) authentication.getPrincipal();
        Department workerDepartment = worker.getDepartment();

        if (!complaint.getDepartment().getId().equals(workerDepartment.getId())) {
            throw new ResourceNotFoundException("Немате пристап до оваа жалба!");
        }

        complaint.setPriority(priority);

        complaintRepository.save(complaint);
    }
}