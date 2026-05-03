package mk.ukim.finki.mojgrad.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import mk.ukim.finki.mojgrad.service.intf.ComplaintCsvService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(ApiConstants.COMPLAINTS)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATION_WORKER')")
public class ComplaintCsvController {

    private final ComplaintCsvService complaintCsvService;

    @Operation(
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
    )
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> importComplaints(
            @RequestPart("file") MultipartFile file,
            Authentication authentication) {

        complaintCsvService.importComplaints(file, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/export")
    public void exportComplaints(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<ComplaintStatus> statuses,
            @RequestParam(required = false) List<Priority> priorities,
            @RequestParam(required = false) LocalDate createdFrom,
            @RequestParam(required = false) LocalDate createdTo,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication,
            HttpServletResponse response) throws IOException {

        ComplaintFilterRequest filter = new ComplaintFilterRequest(title, statuses, priorities, createdFrom, createdTo);
        complaintCsvService.exportComplaints(filter, sortBy, direction, authentication, response);
    }
}