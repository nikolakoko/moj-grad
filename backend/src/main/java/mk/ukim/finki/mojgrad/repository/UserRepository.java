package mk.ukim.finki.mojgrad.repository;

import mk.ukim.finki.mojgrad.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}