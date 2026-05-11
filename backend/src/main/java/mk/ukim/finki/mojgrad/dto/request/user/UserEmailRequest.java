package mk.ukim.finki.mojgrad.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserEmailRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email is not valid")
        String email
) {
}
