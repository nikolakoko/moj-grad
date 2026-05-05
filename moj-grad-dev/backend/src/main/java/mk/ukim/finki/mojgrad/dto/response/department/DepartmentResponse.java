package mk.ukim.finki.mojgrad.dto.response.department;

import lombok.Builder;

@Builder
public record DepartmentResponse(
        Long id,
        String name
) {
}
