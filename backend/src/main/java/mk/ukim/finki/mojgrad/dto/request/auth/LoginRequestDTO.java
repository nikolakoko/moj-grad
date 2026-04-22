package mk.ukim.finki.mojgrad.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(

        @NotBlank(message = "Email is required")
        @Email(message = "Email is not valid")
        String email,

        @NotBlank(message = "Password is required")
        String password
) {
}
