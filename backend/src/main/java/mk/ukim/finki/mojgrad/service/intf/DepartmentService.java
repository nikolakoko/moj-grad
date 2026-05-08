package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.department.DepartmentRequest;
import mk.ukim.finki.mojgrad.dto.response.department.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    List<DepartmentResponse> findAll();

    DepartmentResponse add(DepartmentRequest request);

    void remove(Long id);
}