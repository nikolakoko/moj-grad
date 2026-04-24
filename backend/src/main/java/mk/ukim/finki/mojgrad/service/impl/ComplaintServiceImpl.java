package mk.ukim.finki.mojgrad.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.ClassificationResultDTO;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintTrackingResponse;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.mapper.MyCityExtensions;
import mk.ukim.finki.mojgrad.repository.ComplaintRepository;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
import mk.ukim.finki.mojgrad.service.intf.ComplaintService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final WebClient client;

    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            DepartmentRepository departmentRepository,
            WebClient.Builder builder,
            @Value("${AI_API_KEY}") String apiKey) {
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
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
        complaint.setTrackingToken(UUID.randomUUID().toString());
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
}