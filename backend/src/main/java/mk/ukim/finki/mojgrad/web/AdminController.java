package mk.ukim.finki.mojgrad.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;
import mk.ukim.finki.mojgrad.service.intf.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.ADMIN)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/invite-worker")
    public ResponseEntity<Void> inviteManager(@RequestBody @Valid UserEmailRequest userEmailRequest) {
        adminService.inviteWorker(userEmailRequest);
        return ResponseEntity.ok().build();
    }
}
