package mk.ukim.finki.mojgrad.web;

import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.request.department.DepartmentRequest;
import mk.ukim.finki.mojgrad.dto.response.department.DepartmentResponse;
import mk.ukim.finki.mojgrad.service.intf.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.DEPARTMENTS)
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping("list")
    public ResponseEntity<List<DepartmentResponse>> findAll() {
        return ResponseEntity.ok(departmentService.findAll());
    }

    @PostMapping("add")
    public ResponseEntity<DepartmentResponse> addDepartment(@RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.add(request));
    }

    @DeleteMapping("{id}/remove")
    public ResponseEntity<Void> removeDepartment(@PathVariable Long id) {
        departmentService.remove(id);
        return ResponseEntity.noContent().build();
    }
}