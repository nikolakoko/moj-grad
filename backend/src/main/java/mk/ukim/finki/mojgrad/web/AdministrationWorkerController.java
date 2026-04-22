package mk.ukim.finki.mojgrad.web;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.constants.ApiConstants;
import mk.ukim.finki.mojgrad.service.intf.AdministrationWorkerService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.ADMINISTRATION_WORKER)
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATION_WORKER')")
public class AdministrationWorkerController {

    private final AdministrationWorkerService administrationWorkerService;

    // TODO: add endpoints
}
