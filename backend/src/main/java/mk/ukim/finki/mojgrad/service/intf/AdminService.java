package mk.ukim.finki.mojgrad.service.intf;

import mk.ukim.finki.mojgrad.dto.request.user.UserEmailRequest;

public interface AdminService {
    void inviteWorker(UserEmailRequest userEmailRequest);
}
