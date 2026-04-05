package mk.ukim.finki.mojgrad.domain.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "departments")
public class Department extends BaseEntity {
    @Column(nullable = false)
    private String name;
}
