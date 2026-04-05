package mk.ukim.finki.mojgrad.repository;

import mk.ukim.finki.mojgrad.domain.entities.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
}