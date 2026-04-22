package mk.ukim.finki.mojgrad.web;

import jakarta.validation.Valid;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintTrackingResponse;
import mk.ukim.finki.mojgrad.service.intf.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}