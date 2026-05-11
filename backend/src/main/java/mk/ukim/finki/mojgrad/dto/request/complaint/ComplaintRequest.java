package mk.ukim.finki.mojgrad.dto.request.complaint;

import jakarta.validation.constraints.*;

public record ComplaintRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 50, message = "Title must be at most 50 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 400, message = "Description must be at most 200 characters")
        String description,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
        Double latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
        Double longitude,

        String photo
) {
}