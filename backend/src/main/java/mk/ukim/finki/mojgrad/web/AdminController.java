package mk.ukim.finki.mojgrad.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.AdministrationUserResponse;
import mk.ukim.finki.mojgrad.service.intf.AdminService;
import mk.ukim.finki.mojgrad.service.intf.AdministrationWorkerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.ADMIN)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AdministrationWorkerService administrationWorkerService;

    @GetMapping("/workers")
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

    @PostMapping("/workers/invite")
    public ResponseEntity<Void> inviteWorker(@RequestBody @Valid UserEmailRequest userEmailRequest) {
        adminService.inviteWorker(userEmailRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/workers/edit")
    public ResponseEntity<Void> editWorker(@RequestBody @Valid UserEmailRequest userEmailRequest) {
        adminService.editWorker(userEmailRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/workers/{id}/archive")
    public ResponseEntity<Void> archiveWorker(@PathVariable Long id) {
        adminService.archiveWorker(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/workers/{id}/unarchive")
    public ResponseEntity<Void> unarchiveWorker(@PathVariable Long id) {
        adminService.unarchiveWorker(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/workers/{workerId}/department/{departmentId}")
    public ResponseEntity<Void> assignDepartment(@PathVariable Long workerId, @PathVariable Long departmentId) {
        adminService.assignDepartment(workerId, departmentId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/workers/{workerId}/department/{departmentId}")
    public ResponseEntity<Void> changeDepartment(@PathVariable Long workerId, @PathVariable Long departmentId) {
        adminService.changeDepartment(workerId, departmentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/workers/{workerId}/department")
    public ResponseEntity<Void> removeDepartment(@PathVariable Long workerId) {
        adminService.removeDepartment(workerId);
        return ResponseEntity.ok().build();
    }
}
