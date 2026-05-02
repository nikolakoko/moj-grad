package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.AdministrationUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdministrationWorkerService {
    Page<AdministrationUserResponse> findAdministrativeWorkers(UserFilterRequest filter, Pageable pageable);
}
