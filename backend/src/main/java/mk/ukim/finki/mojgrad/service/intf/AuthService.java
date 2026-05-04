package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.auth.LoginRequestDTO;
import mk.ukim.finki.mojgrad.dto.request.auth.RegisterRequestDTO;
import mk.ukim.finki.mojgrad.dto.response.auth.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO loginRequestDTO);

    void registerAdministrationWorker(RegisterRequestDTO registerRequestDTO, String token);
}
