package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.auth.LoginRequestDTO;
import mk.ukim.finki.mojgrad.dto.request.auth.RegisterRequestDTO;
import mk.ukim.finki.mojgrad.dto.response.auth.AuthResponseDTO;
import mk.ukim.finki.mojgrad.exception.messages.AuthExceptionMessages;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.AuthService;
import mk.ukim.finki.mojgrad.service.intf.JWTService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequestDTO) {

        User user = userRepository.findByEmail(loginRequestDTO.email()).orElseThrow(() -> new UsernameNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));

        if (user.getUserStatus() != UserStatus.REGISTERED) {
            throw new AuthorizationDeniedException(AuthExceptionMessages.ACCESS_DENIED);
        }

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequestDTO.email(), loginRequestDTO.password()));

        String jwt = jwtService.generateToken(user);

        return AuthResponseDTO.fromUser(user, jwt);
    }

    @Override
    public void registerAdministrationWorker(RegisterRequestDTO registerRequestDTO, String token) {
        String email = jwtService.extractClaim(token, claims -> claims.get("email", String.class));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));
        user.setName(registerRequestDTO.name());
        user.setPassword(registerRequestDTO.password());
        user.setUserStatus(UserStatus.REGISTERED);
        user.setEnabled(true);
        userRepository.save(user);
    }
}
