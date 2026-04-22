package mk.ukim.finki.mojgrad.dto.response.complaint;

import lombok.Builder;

@Builder
public record ComplaintTrackingResponse(
        String title,
        String token
) {}
