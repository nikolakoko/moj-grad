package mk.ukim.finki.mojgrad.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record EditUserRequest(
        @Size(min = 2, max = 40, message = "Name must be between 2 and 40 characters")
        String name,

        @Email(message = "Email is not valid")
        String email,

        @Size(min = 6, max = 30, message = "Password must be between 6 and 30 characters")
        String password
) {
}
