package mk.ukim.finki.mojgrad.web;

import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.DEPARTMENTS)
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    // TODO: add endpoints
}