package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public interface ComplaintCsvService {

    void importComplaints(MultipartFile file, Authentication authentication);

    void exportComplaints(ComplaintFilterRequest filter,
                          String sortBy,
                          String direction,
                          Authentication authentication,
                          HttpServletResponse response) throws IOException;
}