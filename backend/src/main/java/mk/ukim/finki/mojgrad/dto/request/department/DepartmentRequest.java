package mk.ukim.finki.mojgrad.dto.request.department;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 40, message = "Name must be between 2 and 40 characters")
        String name
) {
}
