package mk.ukim.finki.mojgrad.dto.request;

public record ComplaintRequest(
        String title,
        String description,
        Double latitude,
        Double longitude,
        String photo,
        Long departmentId
) {
}