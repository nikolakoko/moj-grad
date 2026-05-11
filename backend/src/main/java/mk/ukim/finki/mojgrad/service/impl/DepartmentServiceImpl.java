package mk.ukim.finki.mojgrad.service.impl;

import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.dto.request.department.DepartmentRequest;
import mk.ukim.finki.mojgrad.dto.response.department.DepartmentResponse;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import mk.ukim.finki.mojgrad.mapper.MyCityExtensions;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
import mk.ukim.finki.mojgrad.service.intf.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    public List<DepartmentResponse> findAll() {
        return departmentRepository.findAll()
                .stream()
                .map(MyCityExtensions::departmentToDepartmentResponse)
                .toList();
    }

    @Override
    public DepartmentResponse add(DepartmentRequest request) {
        if (departmentRepository.existsByName(request.name())) {
            throw new IllegalArgumentException(GlobalExceptionMessages.DEPARTMENT_ALREADY_EXISTS);
        }

        Department department = new Department();
        department.setName(request.name());

        return MyCityExtensions.departmentToDepartmentResponse(departmentRepository.save(department));
    }

    @Override
    public void remove(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.RESOURCE_NOT_FOUND));

        departmentRepository.delete(department);
    }
}