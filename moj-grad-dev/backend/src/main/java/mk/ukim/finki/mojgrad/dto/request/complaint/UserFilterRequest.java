package mk.ukim.finki.mojgrad.dto.request.complaint;

import mk.ukim.finki.mojgrad.domain.enums.UserStatus;

import java.util.List;

public record UserFilterRequest(
        String search,
        List<UserStatus> statuses,
        List<Long> departmentIds,
        Boolean enabled
) {}
