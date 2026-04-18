package mk.ukim.finki.mojgrad.web;

import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.dto.request.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.ComplaintTrackingResponse;
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

    @PostMapping
    public ResponseEntity<ComplaintTrackingResponse> create(@RequestBody ComplaintRequest request) {
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

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> findAll() {
        return ResponseEntity.ok(complaintService.findAll());
    }
}