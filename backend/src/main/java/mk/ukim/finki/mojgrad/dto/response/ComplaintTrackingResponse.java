package mk.ukim.finki.mojgrad.dto.response;

import lombok.Builder;

@Builder
public record ComplaintTrackingResponse(
        String title,
        String token
) {}
