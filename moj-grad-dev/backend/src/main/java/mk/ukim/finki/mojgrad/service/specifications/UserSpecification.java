package mk.ukim.finki.mojgrad.service.specifications;

import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class UserSpecification {

    public static Specification<User> filter(UserFilterRequest filter, Role role) {
        return Specification
                .where(hasRole(role))
                .and(hasSearch(filter.search()))
                .and(hasStatuses(filter.statuses()))
                .and(hasDepartments(filter.departmentIds()))
                .and(isEnabled(filter.enabled()));
    }

    private static Specification<User> hasRole(Role role) {
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    private static Specification<User> hasSearch(String search) {
        return (root, query, cb) -> search == null || search.isBlank() ? null
                : cb.or(
                cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("email")), "%" + search.toLowerCase() + "%")
        );
    }

    private static Specification<User> hasStatuses(List<UserStatus> statuses) {
        return (root, query, cb) -> statuses == null || statuses.isEmpty() ? null
                : root.get("userStatus").in(statuses);
    }

    private static Specification<User> hasDepartments(List<Long> departmentIds) {
        return (root, query, cb) -> departmentIds == null || departmentIds.isEmpty() ? null
                : root.get("department").get("id").in(departmentIds);
    }

    private static Specification<User> isEnabled(Boolean enabled) {
        return (root, query, cb) -> enabled == null ? null
                : cb.equal(root.get("enabled"), enabled);
    }
}