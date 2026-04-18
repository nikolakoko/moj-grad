package mk.ukim.finki.mojgrad.repository;

import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByTrackingToken(String trackingToken);
}