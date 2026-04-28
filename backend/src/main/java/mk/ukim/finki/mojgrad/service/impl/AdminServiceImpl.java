package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;
import mk.ukim.finki.mojgrad.events.InviteUserEvent;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ConflictException;
import mk.ukim.finki.mojgrad.exception.messages.AuthExceptionMessages;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.AdminService;
import mk.ukim.finki.mojgrad.service.intf.JWTService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final JWTService jwtService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void inviteWorker(UserEmailRequest userEmailRequest) {

        if (userRepository.existsByEmail(userEmailRequest.email())) {
            throw new ConflictException(AuthExceptionMessages.EMAIL_TAKEN);
        }

        User invitedUser = new User();
        invitedUser.setEmail(userEmailRequest.email());
        invitedUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); //dummy password
        invitedUser.setRole(Role.ADMINISTRATION_WORKER);
        invitedUser.setUserStatus(UserStatus.INVITED);
        invitedUser.setEnabled(false);

        userRepository.save(invitedUser);

        String token = jwtService.generateInviteToken(userEmailRequest.email(), Role.ADMINISTRATION_WORKER);

        InviteUserEvent event = new InviteUserEvent(userEmailRequest.email(), token);
        eventPublisher.publishEvent(event);
    }
}
