package mk.ukim.finki.mojgrad.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.service.intf.AdministrationWorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.ADMINISTRATION_WORKER)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATION_WORKER')")
public class AdministrationWorkerController {
    public final AdministrationWorkerService administrationWorkerService;

    @PatchMapping("/{complaintId}/department/{departmentId}")
    public ResponseEntity<Void> transferDepartment(@PathVariable Long complaintId,
                                                   @PathVariable Long departmentId,
                                                   Authentication authentication) {
        administrationWorkerService.transferDepartment(complaintId, departmentId, authentication);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{complaintId}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long complaintId,
                                             @RequestParam ComplaintStatus status,
                                             Authentication authentication) {
        administrationWorkerService.updateStatus(complaintId, status, authentication);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{complaintId}/priority")
    public ResponseEntity<Void> updatePriority(@PathVariable Long complaintId,
                                               @RequestParam Priority priority,
                                               Authentication authentication) {
        administrationWorkerService.updatePriority(complaintId, priority, authentication);
        return ResponseEntity.ok().build();
    }
}
