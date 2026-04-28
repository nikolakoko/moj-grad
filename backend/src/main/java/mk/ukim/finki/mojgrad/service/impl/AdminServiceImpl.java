package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;
import mk.ukim.finki.mojgrad.events.InviteUserEvent;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ConflictException;
import mk.ukim.finki.mojgrad.exception.messages.AuthExceptionMessages;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.AdminService;
import mk.ukim.finki.mojgrad.service.intf.JWTService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final JWTService jwtService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public void inviteWorker(UserEmailRequest userEmailRequest) {

        if (userRepository.existsByEmail(userEmailRequest.email())) {
            throw new ConflictException(AuthExceptionMessages.EMAIL_TAKEN);
        }

//        String token = jwtService.generateInviteToken(userEmailRequest.email(), Role.ADMINISTRATION_WORKER);
        String token = "Test";

        InviteUserEvent event = new InviteUserEvent(userEmailRequest.email(), token);
        eventPublisher.publishEvent(event);
    }
}
