package mk.ukim.finki.mojgrad.dto.response.complaint;

import lombok.Builder;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;

@Builder
public record AdministrationUserResponse(
        Long id,
        String name,
        String email,
        UserStatus status,
        String departmentName,
        boolean enabled
) {
}