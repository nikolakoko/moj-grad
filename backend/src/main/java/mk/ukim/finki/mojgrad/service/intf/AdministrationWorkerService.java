package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.AdministrationUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

public interface AdministrationWorkerService {
    Page<AdministrationUserResponse> findAdministrativeWorkers(UserFilterRequest filter, Pageable pageable);

    void transferDepartment(Long complaintId, Long departmentId, Authentication authentication);

    void updateStatus(Long id, ComplaintStatus status, Authentication authentication);

    void updatePriority(Long id, Priority priority, Authentication authentication);
}
