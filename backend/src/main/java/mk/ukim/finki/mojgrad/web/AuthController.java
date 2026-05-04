package mk.ukim.finki.mojgrad.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.request.auth.LoginRequestDTO;
import mk.ukim.finki.mojgrad.dto.request.auth.RegisterRequestDTO;
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
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid LoginRequestDTO loginRequestDTO) {
        return new ResponseEntity<>(authService.login(loginRequestDTO), HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<Void> registerLocalWorker(@RequestBody @Valid RegisterRequestDTO registerRequestDTO, @RequestHeader(value = "Mail-Token") String token) {
        authService.registerAdministrationWorker(registerRequestDTO, token);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
