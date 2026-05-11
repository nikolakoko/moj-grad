package mk.ukim.finki.mojgrad.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.request.user.EditUserRequest;
import mk.ukim.finki.mojgrad.dto.request.auth.LoginRequest;
import mk.ukim.finki.mojgrad.dto.request.auth.RegisterRequest;
import mk.ukim.finki.mojgrad.dto.response.auth.AuthResponseDTO;
import mk.ukim.finki.mojgrad.service.intf.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid LoginRequest loginRequest) {
        return new ResponseEntity<>(authService.login(loginRequest), HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<Void> registerLocalWorker(@RequestBody @Valid RegisterRequest registerRequest, @RequestHeader(value = "Mail-Token") String token) {
        authService.registerAdministrationWorker(registerRequest, token);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/edit")
    public ResponseEntity<Void> editLocalWorker(@RequestBody @Valid EditUserRequest editUserRequest, @RequestHeader(value = "Mail-Token") String token) {
        authService.editAdministrationWorker(editUserRequest, token);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
