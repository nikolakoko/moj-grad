package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.user.EditUserRequest;
import mk.ukim.finki.mojgrad.dto.request.auth.LoginRequest;
import mk.ukim.finki.mojgrad.dto.request.auth.RegisterRequest;
import mk.ukim.finki.mojgrad.dto.response.auth.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequest loginRequest);

    void registerAdministrationWorker(RegisterRequest registerRequest, String token);

    void editAdministrationWorker(EditUserRequest editUserRequest, String token);
}
