package mk.ukim.finki.mojgrad.mapper;

import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintResponse;
import mk.ukim.finki.mojgrad.dto.response.complaint.ComplaintTrackingResponse;

public class MyCityExtensions {

    public static ComplaintResponse complaintToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .latitude(complaint.getLatitude())
                .longitude(complaint.getLongitude())
                .complaintStatus(complaint.getComplaintStatus())
                .priority(complaint.getPriority())
                .photo(complaint.getPhoto())
                .departmentName(complaint.getDepartment().getName())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    public static ComplaintTrackingResponse complaintToTrackingResponse(Complaint complaint) {
        return ComplaintTrackingResponse.builder()
                .title(complaint.getTitle())
                .token(complaint.getTrackingToken())
                .build();
    }
}