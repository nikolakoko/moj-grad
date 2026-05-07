package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;

public interface AdminService {
    void inviteWorker(UserEmailRequest userEmailRequest);

    void editWorker(UserEmailRequest userEmailRequest);

    void archiveWorker(Long id);

    void unarchiveWorker(Long id);
}
