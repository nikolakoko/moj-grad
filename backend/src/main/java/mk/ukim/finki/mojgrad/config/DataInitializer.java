package mk.ukim.finki.mojgrad.config;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.domain.enums.UserStatus;
import mk.ukim.finki.mojgrad.repository.ComplaintRepository;
import mk.ukim.finki.mojgrad.repository.DepartmentRepository;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) return;

        Department infrastructure = new Department();
        infrastructure.setName("Инфраструктура");

        Department utilities = new Department();
        utilities.setName("Комунални услуги");

        Department sanitation = new Department();
        sanitation.setName("Хигиена");

        departmentRepository.saveAll(List.of(infrastructure, utilities, sanitation));


        User admin = new User();
        admin.setName("Администратор Корисник");
        admin.setEmail("admin@mojgrad.mk");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin.setUserStatus(UserStatus.REGISTERED);
        admin.setDepartment(null);

        User worker1 = new User();
        worker1.setName("Марија Петрова");
        worker1.setEmail("marija@mojgrad.mk");
        worker1.setPassword(passwordEncoder.encode("worker123"));
        worker1.setRole(Role.ADMINISTRATION_WORKER);
        worker1.setEnabled(true);
        worker1.setUserStatus(UserStatus.REGISTERED);
        worker1.setDepartment(infrastructure);

        User worker2 = new User();
        worker2.setName("Петар Илиевски");
        worker2.setEmail("petar@mojgrad.mk");
        worker2.setPassword(passwordEncoder.encode("worker123"));
        worker2.setRole(Role.ADMINISTRATION_WORKER);
        worker2.setEnabled(true);
        worker2.setUserStatus(UserStatus.REGISTERED);
        worker2.setDepartment(utilities);

        userRepository.saveAll(List.of(admin, worker1, worker2));

        Complaint c1 = new Complaint();
        c1.setTitle("Дупка на улица Партизанска");
        c1.setDescription("Голема дупка која предизвикува оштетување на возилата во близина на центарот на градот.");
        c1.setLatitude(41.9989);
        c1.setLongitude(21.4219);
        c1.setComplaintStatus(ComplaintStatus.PENDING);
        c1.setPriority(Priority.HIGH);
        c1.setPhoto("https://sdk.mk/wp-content/uploads/2023/01/kontejner-partizanska-650x388.jpg");
        c1.setDepartment(infrastructure);

        Complaint c2 = new Complaint();
        c2.setTitle("Уличното осветлување не работи");
        c2.setDescription("Три последователни улични светилки се исклучени на булевар Илинден.");
        c2.setLatitude(42.0066);
        c2.setLongitude(21.4122);
        c2.setComplaintStatus(ComplaintStatus.IN_PROGRESS);
        c2.setPriority(Priority.MEDIUM);
        c2.setPhoto("https://trn.mk/wp-content/uploads/2023/12/ilindenska.jpg");
        c2.setDepartment(utilities);

        Complaint c3 = new Complaint();
        c3.setTitle("Преполни контејнери за отпад");
        c3.setDescription("Контејнерите кај битпазар не се испразнети повеќе од една недела.");
        c3.setLatitude(42.0035);
        c3.setLongitude(21.4390);
        c3.setComplaintStatus(ComplaintStatus.PENDING);
        c3.setPriority(Priority.LOW);
        c3.setDepartment(sanitation);

        complaintRepository.saveAll(List.of(c1, c2, c3));

        System.out.println("Seed data loaded successfully.");
    }
}