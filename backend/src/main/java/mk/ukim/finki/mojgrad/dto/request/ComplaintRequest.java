package mk.ukim.finki.mojgrad.dto.request;

import mk.ukim.finki.mojgrad.domain.enums.Priority;

public record ComplaintRequest(
        String title,
        String description,
        Double latitude,
        Double longitude,
        Priority priority,
        String photo,
        Long departmentId
) {
}