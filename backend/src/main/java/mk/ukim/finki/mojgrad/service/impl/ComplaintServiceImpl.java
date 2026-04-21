package mk.ukim.finki.mojgrad.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.ComplaintTrackingResponse;
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
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Одделот не е пронајден!"));

        Priority priority = classifyPriority(request.title(), request.description());

        Complaint complaint = new Complaint();
        complaint.setTitle(request.title());
        complaint.setTrackingToken(UUID.randomUUID().toString());
        complaint.setDescription(request.description());
        complaint.setLatitude(request.latitude());
        complaint.setLongitude(request.longitude());
        complaint.setPriority(priority);
        complaint.setPhoto(request.photo());
        complaint.setDepartment(department);
        complaint.setComplaintStatus(ComplaintStatus.PENDING);

        return MyCityExtensions.complaintToTrackingResponse(complaintRepository.save(complaint));
    }

    private Priority classifyPriority(String title, String description) {
        try {
            String systemPrompt = """
                    You are a complaint priority classifier for a city management system.
                    Given a complaint title and description, respond ONLY with a JSON object like:
                    {"priority": "HIGH"}
                    Priority must be one of: LOW, MEDIUM, HIGH
                    Rules:
                    - HIGH: significant infrastructure issues
                    - MEDIUM: moderate issues
                    - LOW: minor issues
                    No explanation, no markdown, just the JSON.
                    """;

            String userPrompt = "Title: " + title + "\nDescription: " + description;

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
            JsonNode priorityNode = mapper.readTree(content);
            return Priority.valueOf(priorityNode.path("priority").asText("LOW"));

        } catch (Exception e) {
            return Priority.MEDIUM;
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