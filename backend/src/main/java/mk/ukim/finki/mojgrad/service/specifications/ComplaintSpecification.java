package mk.ukim.finki.mojgrad.service.specifications;

import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

public class ComplaintSpecification {

    public static Specification<Complaint> filter(ComplaintFilterRequest filter, Department department) {
        return Specification
                .where(hasDepartment(department))
                .and(hasTitle(filter.title()))
                .and(hasStatuses(filter.statuses()))
                .and(hasPriorities(filter.priorities()))
                .and(createdAfter(filter.createdFrom()))
                .and(createdBefore(filter.createdTo()));
    }

    private static Specification<Complaint> hasDepartment(Department department) {
        return (root, query, cb) -> cb.equal(root.get("department"), department);
    }

    private static Specification<Complaint> hasTitle(String title) {
        return (root, query, cb) -> title == null || title.isBlank() ? null
                : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    private static Specification<Complaint> hasStatuses(List<ComplaintStatus> statuses) {
        return (root, query, cb) -> statuses == null || statuses.isEmpty() ? null
                : root.get("complaintStatus").in(statuses);
    }

    private static Specification<Complaint> hasPriorities(List<Priority> priorities) {
        return (root, query, cb) -> priorities == null || priorities.isEmpty() ? null
                : root.get("priority").in(priorities);
    }

    private static Specification<Complaint> createdAfter(LocalDate from) {
        return (root, query, cb) -> from == null ? null
                : cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay());
    }

    private static Specification<Complaint> createdBefore(LocalDate to) {
        return (root, query, cb) -> to == null ? null
                : cb.lessThanOrEqualTo(root.get("createdAt"), to.plusDays(1).atStartOfDay());
    }
}