package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.user.EditUserRequest;
import mk.ukim.finki.mojgrad.dto.request.auth.LoginRequest;
import mk.ukim.finki.mojgrad.dto.request.auth.RegisterRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponseDTO login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.email()).orElseThrow(() -> new UsernameNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));

        if (user.getUserStatus() != UserStatus.REGISTERED) {
            throw new AuthorizationDeniedException(AuthExceptionMessages.ACCESS_DENIED);
        }

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));

        String jwt = jwtService.generateToken(user);

        return AuthResponseDTO.fromUser(user, jwt);
    }

    @Override
    public void registerAdministrationWorker(RegisterRequest registerRequest, String token) {
        String email = jwtService.extractClaim(token, claims -> claims.get("email", String.class));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));

        user.setName(registerRequest.name());
        user.setPassword(passwordEncoder.encode(registerRequest.password()));
        user.setUserStatus(UserStatus.REGISTERED);
        user.setEnabled(true);

        userRepository.save(user);
    }

    @Override
    public void editAdministrationWorker(EditUserRequest editUserRequest, String token) {
        String email = jwtService.extractClaim(token, claims -> claims.get("email", String.class));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));

        if (user.getUserStatus() != UserStatus.REGISTERED) {
            throw new AuthorizationDeniedException(AuthExceptionMessages.ACCESS_DENIED);
        }

        if (editUserRequest.name() != null && !editUserRequest.name().isBlank()) {
            user.setName(editUserRequest.name());
        }
        if (editUserRequest.email() != null && !editUserRequest.email().isBlank()) {
            user.setEmail(editUserRequest.email());
        }
        if (editUserRequest.password() != null && !editUserRequest.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(editUserRequest.password()));
        }

        userRepository.save(user);
    }
}
