package mk.ukim.finki.mojgrad.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.AdministrationUserResponse;
import mk.ukim.finki.mojgrad.service.intf.AdministrationWorkerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.ADMINISTRATION_WORKER)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATION_WORKER')")
public class AdministrationWorkerController {

    private final AdministrationWorkerService administrationWorkerService;

    @GetMapping
    public ResponseEntity<Page<AdministrationUserResponse>> findAdministrativeWorkers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<UserStatus> statuses,
            @RequestParam(required = false) List<Long> departmentIds,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        UserFilterRequest filter = new UserFilterRequest(search, statuses, departmentIds, enabled);
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(administrationWorkerService.findAdministrativeWorkers(filter, pageable));
    }
}
