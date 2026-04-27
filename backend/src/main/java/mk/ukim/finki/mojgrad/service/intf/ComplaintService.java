package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintTrackingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ComplaintService {
    ComplaintTrackingResponse create(ComplaintRequest dto);

    ComplaintResponse findById(Long id);

    ComplaintResponse findByToken(String token);

    List<ComplaintResponse> findAll();

    Page<ComplaintResponse> findAllByDepartment(ComplaintFilterRequest filter, Pageable pageable, Authentication authentication);
}