package mk.ukim.finki.mojgrad.dto.response;

import lombok.Builder;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;

import java.time.LocalDateTime;

@Builder
public record ComplaintResponse(
        Long id,
        String title,
        String description,
        Double latitude,
        Double longitude,
        ComplaintStatus complaintStatus,
        Priority priority,
        String photo,
        String departmentName,
        LocalDateTime createdAt
) {}