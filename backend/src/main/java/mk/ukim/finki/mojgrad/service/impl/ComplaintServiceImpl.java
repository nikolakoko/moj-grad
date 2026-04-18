package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.ComplaintTrackingResponse;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.mapper.MyCityExtensions;
import mk.ukim.finki.mojgrad.repository.ComplaintRepository;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
import mk.ukim.finki.mojgrad.service.intf.ComplaintService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public ComplaintTrackingResponse create(ComplaintRequest request) {
        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Одделот не е пронајден!"));

        Complaint complaint = new Complaint();
        complaint.setTitle(request.title());
        complaint.setTrackingToken(UUID.randomUUID().toString());
        complaint.setDescription(request.description());
        complaint.setLatitude(request.latitude());
        complaint.setLongitude(request.longitude());
        complaint.setPriority(Priority.LOW); //hard coded for now, later will be determined with AI
        complaint.setPhoto(request.photo());
        complaint.setDepartment(department);
        complaint.setComplaintStatus(ComplaintStatus.PENDING);

        return MyCityExtensions.complaintToTrackingResponse(complaintRepository.save(complaint));
    }

    @Override
    public ComplaintResponse findById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Жалбата не е пронајдена!"));
        return MyCityExtensions.complaintToResponse(complaint);
    }

    @Override
    public ComplaintResponse findByToken(String token) {
        return MyCityExtensions.complaintToResponse(complaintRepository.findByTrackingToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Невалиден токен!")));
    }

    @Override
    public List<ComplaintResponse> findAll() {
        return complaintRepository.findAll()
                .stream()
                .map(MyCityExtensions::complaintToResponse)
                .toList();
    }
}