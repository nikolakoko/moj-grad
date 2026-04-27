package mk.ukim.finki.mojgrad.web;

import jakarta.validation.Valid;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintTrackingResponse;
import mk.ukim.finki.mojgrad.service.intf.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(ApiConstants.COMPLAINTS)
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/create")
    public ResponseEntity<ComplaintTrackingResponse> create(@RequestBody @Valid ComplaintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.findById(id));
    }

    @GetMapping("/by-token")
    public ResponseEntity<ComplaintResponse> findByToken(@RequestParam String token) {
        return ResponseEntity.ok(complaintService.findByToken(token));
    }

    @GetMapping("list")
    public ResponseEntity<List<ComplaintResponse>> findAll() {
        return ResponseEntity.ok(complaintService.findAll());
    }

    @GetMapping("/by-department")
    public ResponseEntity<Page<ComplaintResponse>> findAllByDepartment(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<ComplaintStatus> statuses,
            @RequestParam(required = false) List<Priority> priorities,
            @RequestParam(required = false) LocalDate createdFrom,
            @RequestParam(required = false) LocalDate createdTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication) {

        ComplaintFilterRequest filter = new ComplaintFilterRequest(title, statuses, priorities, createdFrom, createdTo);
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(complaintService.findAllByDepartment(filter, pageable, authentication));
    }
}