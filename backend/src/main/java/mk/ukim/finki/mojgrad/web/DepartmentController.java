package mk.ukim.finki.mojgrad.web;

import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.response.department.DepartmentResponse;
import mk.ukim.finki.mojgrad.service.intf.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.DEPARTMENTS)
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping("/list")
    public ResponseEntity<List<DepartmentResponse>> findAll() {
        List<DepartmentResponse> response = departmentService.findAll();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}