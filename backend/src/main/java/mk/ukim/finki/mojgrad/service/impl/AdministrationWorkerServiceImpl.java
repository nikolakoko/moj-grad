package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.AdministrationUserResponse;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ForbiddenAccessException;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import mk.ukim.finki.mojgrad.repository.ComplaintRepository;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.AdministrationWorkerService;
import mk.ukim.finki.mojgrad.service.specifications.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import mk.ukim.finki.mojgrad.mapper.MyCityExtensions;

@Service
@RequiredArgsConstructor
public class AdministrationWorkerServiceImpl implements AdministrationWorkerService {
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public Page<AdministrationUserResponse> findAdministrativeWorkers(UserFilterRequest filter, Pageable pageable) {
        return userRepository.findAll(UserSpecification.filter(filter, Role.ADMINISTRATION_WORKER), pageable)
                .map(MyCityExtensions::userToAdministrationWorkerResponse);
    }

    @Override
    public void transferDepartment(Long complaintId, Long departmentId, Authentication authentication) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));


        User worker = (User) authentication.getPrincipal();
        Department workerDepartment = worker.getDepartment();

        if (!complaint.getDepartment().getId().equals(workerDepartment.getId())) {
            throw new ForbiddenAccessException(GlobalExceptionMessages.RESOURCE_ACCESS_DENIED);
        }

        complaint.setDepartment(department);

        complaintRepository.save(complaint);
    }

    @Override
    public void updateStatus(Long id, ComplaintStatus status, Authentication authentication) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));

        User worker = (User) authentication.getPrincipal();
        Department workerDepartment = worker.getDepartment();

        if (!complaint.getDepartment().getId().equals(workerDepartment.getId())) {
            throw new ForbiddenAccessException(GlobalExceptionMessages.RESOURCE_ACCESS_DENIED);
        }

        complaint.setComplaintStatus(status);

        complaintRepository.save(complaint);
    }

    @Override
    public void updatePriority(Long id, Priority priority, Authentication authentication) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));

        User worker = (User) authentication.getPrincipal();
        Department workerDepartment = worker.getDepartment();

        if (!complaint.getDepartment().getId().equals(workerDepartment.getId())) {
            throw new ForbiddenAccessException(GlobalExceptionMessages.RESOURCE_ACCESS_DENIED);
        }

        complaint.setPriority(priority);

        complaintRepository.save(complaint);
    }

}