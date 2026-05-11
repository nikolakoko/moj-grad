package mk.ukim.finki.mojgrad.dto.request.complaint;

import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;

import java.time.LocalDate;
import java.util.List;

public record ComplaintFilterRequest(
        String title,
        List<ComplaintStatus> statuses,
        List<Priority> priorities,
        LocalDate createdFrom,
        LocalDate createdTo
) {
}
