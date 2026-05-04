package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.entities.Complaint;
import mk.ukim.finki.mojgrad.domain.entities.Department;
import mk.ukim.finki.mojgrad.domain.entities.User;
import mk.ukim.finki.mojgrad.domain.enums.ComplaintStatus;
import mk.ukim.finki.mojgrad.domain.enums.Priority;
import mk.ukim.finki.mojgrad.dto.request.complaint.ComplaintFilterRequest;
import mk.ukim.finki.mojgrad.exception.exceptions.global.BadRequestException;
import mk.ukim.finki.mojgrad.exception.exceptions.global.CsvImportException;
import mk.ukim.finki.mojgrad.exception.exceptions.global.ResourceNotFoundException;
import mk.ukim.finki.mojgrad.exception.messages.CsvExceptionMessages;
import mk.ukim.finki.mojgrad.exception.messages.GlobalExceptionMessages;
import mk.ukim.finki.mojgrad.repository.ComplaintRepository;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.ComplaintCsvService;
import mk.ukim.finki.mojgrad.service.specifications.ComplaintSpecification;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintCsvServiceImpl implements ComplaintCsvService {

    private static final String HEADER_ID          = "id";
    private static final String HEADER_TITLE       = "title";
    private static final String HEADER_DESCRIPTION = "description";
    private static final String HEADER_LATITUDE    = "latitude";
    private static final String HEADER_LONGITUDE   = "longitude";
    private static final String HEADER_PRIORITY    = "priority";
    private static final String HEADER_STATUS      = "status";
    private static final String HEADER_DEPARTMENT  = "department";
    private static final String HEADER_CREATED_AT  = "createdAt";
    private static final String HEADER_PHOTO       = "photo";

    private static final Set<String> REQUIRED_HEADERS = Set.of(
            HEADER_TITLE,
            HEADER_DESCRIPTION,
            HEADER_LATITUDE,
            HEADER_LONGITUDE,
            HEADER_PRIORITY,
            HEADER_STATUS,
            HEADER_DEPARTMENT
    );

    private static final String[] EXPORT_HEADERS = {
            HEADER_ID,
            HEADER_TITLE,
            HEADER_DESCRIPTION,
            HEADER_LATITUDE,
            HEADER_LONGITUDE,
            HEADER_PRIORITY,
            HEADER_STATUS,
            HEADER_DEPARTMENT,
            HEADER_CREATED_AT,
            HEADER_PHOTO
    };

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt", "priority", "complaintStatus", "title"
    );

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Override
    public void importComplaints(MultipartFile file, Authentication authentication) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(CsvExceptionMessages.EMPTY_FILE);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            throw new BadRequestException(String.format(
                    CsvExceptionMessages.INVALID_FILE_TYPE,
                    originalFilename != null ? originalFilename : "unknown"
            ));
        }

        String principalEmail = ((User) authentication.getPrincipal()).getEmail();
        User worker = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));

        Department workerDepartment = worker.getDepartment();
        String workerDeptName = workerDepartment.getName();

        List<Complaint> toSave = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            CSVParser parser = format.parse(reader);

            Set<String> actualHeaders = parser.getHeaderMap().keySet();
            for (String required : REQUIRED_HEADERS) {
                if (!actualHeaders.contains(required)) {
                    throw new CsvImportException(CsvExceptionMessages.MISSING_HEADERS);
                }
            }

            List<CSVRecord> records = parser.getRecords();

            if (records.isEmpty()) {
                throw new CsvImportException(CsvExceptionMessages.EMPTY_CSV);
            }

            int rowNum = 2;
            for (CSVRecord record : records) {

                if (record.size() < REQUIRED_HEADERS.size()) {
                    throw new CsvImportException(String.format(CsvExceptionMessages.MALFORMED_ROW, rowNum));
                }

                String title       = getField(record, HEADER_TITLE);
                String description = getField(record, HEADER_DESCRIPTION);
                String latStr      = getField(record, HEADER_LATITUDE);
                String lonStr      = getField(record, HEADER_LONGITUDE);
                String priorityStr = getField(record, HEADER_PRIORITY);
                String statusStr   = getField(record, HEADER_STATUS);
                String deptName    = getField(record, HEADER_DEPARTMENT);

                String photo = "";
                if (actualHeaders.contains(HEADER_PHOTO)) {
                    photo = getField(record, HEADER_PHOTO);
                }

                if (title.isBlank()) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.MISSING_FIELD, rowNum, HEADER_TITLE
                    ));
                }
                if (title.length() > 50) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.FIELD_TOO_LONG, rowNum, HEADER_TITLE, 50
                    ));
                }

                if (description.isBlank()) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.MISSING_FIELD, rowNum, HEADER_DESCRIPTION
                    ));
                }
                if (description.length() > 400) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.FIELD_TOO_LONG, rowNum, HEADER_DESCRIPTION, 400
                    ));
                }

                if (photo != null && !photo.isBlank() && photo.length() > 2000) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.FIELD_TOO_LONG, rowNum, HEADER_PHOTO, 2000
                    ));
                }

                if (deptName.isBlank()) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.MISSING_FIELD, rowNum, HEADER_DEPARTMENT
                    ));
                }
                if (!deptName.equalsIgnoreCase(workerDeptName)) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.DEPARTMENT_MISMATCH, rowNum, deptName, workerDeptName
                    ));
                }

                if (latStr.isBlank()) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.MISSING_FIELD, rowNum, HEADER_LATITUDE
                    ));
                }
                double latitude = parseDouble(latStr, HEADER_LATITUDE, rowNum);
                if (latitude < -90 || latitude > 90) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.OUT_OF_RANGE, rowNum, HEADER_LATITUDE, latStr, "-90 to 90"
                    ));
                }

                if (lonStr.isBlank()) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.MISSING_FIELD, rowNum, HEADER_LONGITUDE
                    ));
                }
                double longitude = parseDouble(lonStr, HEADER_LONGITUDE, rowNum);
                if (longitude < -180 || longitude > 180) {
                    throw new CsvImportException(String.format(
                            CsvExceptionMessages.OUT_OF_RANGE, rowNum, HEADER_LONGITUDE, lonStr, "-180 to 180"
                    ));
                }

                Priority priority = parseEnum(
                        Priority.class, priorityStr, HEADER_PRIORITY,
                        "LOW, MEDIUM, HIGH", rowNum
                );

                ComplaintStatus status = parseEnum(
                        ComplaintStatus.class, statusStr, HEADER_STATUS,
                        "PENDING, IN_PROGRESS, RESOLVED, REJECTED", rowNum
                );

                Complaint complaint = new Complaint();
                complaint.setTitle(title);
                complaint.setDescription(description);
                complaint.setLatitude(latitude);
                complaint.setLongitude(longitude);
                complaint.setPriority(priority);
                complaint.setComplaintStatus(status);
                complaint.setDepartment(workerDepartment);
                complaint.setTrackingToken(generateTrackingToken());
                complaint.setPhoto(photo == null || photo.isBlank() ? null : photo);

                toSave.add(complaint);
                rowNum++;
            }

        } catch (CsvImportException | BadRequestException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new CsvImportException("Unexpected value error: " + e.getMessage());
        } catch (IOException e) {
            throw new BadRequestException(CsvExceptionMessages.INVALID_FORMAT);
        }

        complaintRepository.saveAll(toSave);
    }

    @Override
    public void exportComplaints(ComplaintFilterRequest filter,
                                 String sortBy,
                                 String direction,
                                 Authentication authentication,
                                 HttpServletResponse response) throws IOException {

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new BadRequestException(String.format(
                    CsvExceptionMessages.INVALID_SORT_FIELD, sortBy
            ));
        }
        if (!direction.equalsIgnoreCase("asc") && !direction.equalsIgnoreCase("desc")) {
            throw new BadRequestException(String.format(
                    CsvExceptionMessages.INVALID_SORT_DIRECTION, direction
            ));
        }

        String principalEmail = ((User) authentication.getPrincipal()).getEmail();
        User worker = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResourceNotFoundException(GlobalExceptionMessages.USER_NOT_FOUND));

        Department workerDepartment = worker.getDepartment();

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        List<Complaint> complaints = complaintRepository.findAll(
                ComplaintSpecification.filter(filter, workerDepartment),
                sort
        );

        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=complaints.csv");

        PrintWriter writer = response.getWriter();
        writer.write('\uFEFF');

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(EXPORT_HEADERS)
                .build();

        try (CSVPrinter printer = new CSVPrinter(writer, format)) {
            for (Complaint c : complaints) {
                printer.printRecord(
                        c.getId(),
                        c.getTitle(),
                        c.getDescription(),
                        c.getLatitude(),
                        c.getLongitude(),
                        c.getPriority(),
                        c.getComplaintStatus(),
                        c.getDepartment().getName(),
                        c.getCreatedAt(),
                        c.getPhoto()
                );
            }
        } catch (IOException e) {
            throw new BadRequestException(CsvExceptionMessages.EXPORT_WRITE_ERROR);
        }
    }

    private String getField(CSVRecord record, String fieldName) {
        try {
            String value = record.get(fieldName);
            return value != null ? value : "";
        } catch (IllegalArgumentException e) {
            throw new CsvImportException(CsvExceptionMessages.MISSING_HEADERS);
        }
    }

    private double parseDouble(String value, String fieldName, int rowNum) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            throw new CsvImportException(
                    String.format(CsvExceptionMessages.INVALID_NUMBER, rowNum, fieldName, value)
            );
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass,
                                            String value,
                                            String fieldName,
                                            String allowed,
                                            int rowNum) {
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CsvImportException(
                    String.format(CsvExceptionMessages.INVALID_ENUM, rowNum, fieldName, value, allowed)
            );
        }
    }

    private String generateTrackingToken() {
        String token;
        do {
            token = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 10)
                    .toUpperCase();
        } while (complaintRepository.existsByTrackingToken(token));
        return token;
    }
}