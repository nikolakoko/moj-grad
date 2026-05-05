package mk.ukim.finki.mojgrad.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.domain.enums.Role;
import mk.ukim.finki.mojgrad.dto.request.complaint.UserFilterRequest;
import mk.ukim.finki.mojgrad.dto.response.complaint.AdministrationUserResponse;
import mk.ukim.finki.mojgrad.repository.UserRepository;
import mk.ukim.finki.mojgrad.service.intf.AdministrationWorkerService;
import mk.ukim.finki.mojgrad.service.specifications.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import mk.ukim.finki.mojgrad.mapper.MyCityExtensions;

@Service
@RequiredArgsConstructor
public class AdministrationWorkerServiceImpl implements AdministrationWorkerService {
    private final UserRepository userRepository;

    @Override
    public Page<AdministrationUserResponse> findAdministrativeWorkers(UserFilterRequest filter, Pageable pageable) {
        return userRepository.findAll(UserSpecification.filter(filter, Role.ADMINISTRATION_WORKER), pageable)
                .map(MyCityExtensions::userToAdministrationWorkerResponse);
    }

}