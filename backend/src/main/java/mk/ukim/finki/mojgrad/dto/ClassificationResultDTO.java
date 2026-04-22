package mk.ukim.finki.mojgrad.dto;

import mk.ukim.finki.mojgrad.domain.enums.Priority;

public record ClassificationResultDTO(Priority priority, String departmentName) {
}
