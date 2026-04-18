package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.ComplaintRequest;
import mk.ukim.finki.mojgrad.dto.response.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.ComplaintTrackingResponse;

import java.util.List;

public interface ComplaintService {
    ComplaintTrackingResponse create(ComplaintRequest dto);

    ComplaintResponse findById(Long id);

    ComplaintResponse findByToken(String token);

    List<ComplaintResponse> findAll();
}