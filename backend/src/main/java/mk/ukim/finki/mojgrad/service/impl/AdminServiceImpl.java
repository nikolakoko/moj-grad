package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.MailTokenPurpose;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;
import mk.ukim.finki.mojgrad.events.EditUserEvent;
import mk.ukim.finki.mojgrad.events.InviteUserEvent;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ConflictException;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ForbiddenAccessException;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.exception.messages.AuthExceptionMessages;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
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
    private final DepartmentRepository departmentRepository;
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

        String token = jwtService.generateMailToken(userEmailRequest.email(), MailTokenPurpose.REGISTER);

        InviteUserEvent event = new InviteUserEvent(userEmailRequest.email(), token);
        eventPublisher.publishEvent(event);
    }

    @Override
    public void editWorker(UserEmailRequest userEmailRequest) {

        if (!userRepository.existsByEmail(userEmailRequest.email())) {
            throw new ConflictException(GlobalExceptionMessages.USER_NOT_FOUND);
        }

        String token = jwtService.generateMailToken(userEmailRequest.email(), MailTokenPurpose.EDIT);

        EditUserEvent event = new EditUserEvent(userEmailRequest.email(), token);
        eventPublisher.publishEvent(event);
    }

    @Override
    public void archiveWorker(Long id) {
        User worker = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getRole() == Role.ADMIN)
            throw new ForbiddenAccessException(GlobalExceptionMessages.ADMIN_CANNOT_BE_ARCHIVED);
        if (!worker.isEnabled())
            throw new ConflictException(GlobalExceptionMessages.WORKER_ALREADY_DISABLED);
        worker.setEnabled(false);
        userRepository.save(worker);
    }

    @Override
    public void unarchiveWorker(Long id) {
        User worker = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getRole() == Role.ADMIN)
            throw new ForbiddenAccessException(GlobalExceptionMessages.ADMIN_CANNOT_BE_ARCHIVED);
        if (worker.isEnabled())
            throw new ConflictException(GlobalExceptionMessages.WORKER_ALREADY_ENABLED);
        worker.setEnabled(true);
        userRepository.save(worker);
    }

    @Override
    public void assignDepartment(Long workerId, Long departmentId) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getRole() == Role.ADMIN)
            throw new ForbiddenAccessException(GlobalExceptionMessages.ADMIN_CANNOT_HAVE_DEPARTMENT);
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getDepartment() != null)
            throw new ConflictException(GlobalExceptionMessages.WORKER_ALREADY_HAS_DEPARTMENT);
        worker.setDepartment(department);
        userRepository.save(worker);
    }

    @Override
    public void changeDepartment(Long workerId, Long departmentId) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getRole() == Role.ADMIN)
            throw new ForbiddenAccessException(GlobalExceptionMessages.ADMIN_CANNOT_HAVE_DEPARTMENT);
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getDepartment() == null)
            throw new ConflictException(GlobalExceptionMessages.WORKER_HAS_NO_DEPARTMENT);
        worker.setDepartment(department);
        userRepository.save(worker);
    }

    @Override
    public void removeDepartment(Long workerId) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));
        if (worker.getRole() == Role.ADMIN)
            throw new ForbiddenAccessException(GlobalExceptionMessages.ADMIN_CANNOT_HAVE_DEPARTMENT);
        if (worker.getDepartment() == null)
            throw new ConflictException(GlobalExceptionMessages.WORKER_HAS_NO_DEPARTMENT);
        worker.setDepartment(null);
        userRepository.save(worker);
    }


}
