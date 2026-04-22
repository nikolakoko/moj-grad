package mk.ukim.finki.mojgrad.service.impl;

import mk.ukim.finki.mojgrad.dto.response.department.DepartmentResponse;
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
}