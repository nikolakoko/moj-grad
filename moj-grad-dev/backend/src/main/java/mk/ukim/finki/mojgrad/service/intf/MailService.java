package mk.ukim.finki.mojgrad.service.intf;

public interface MailService {
    void sendEmail(String to, String subject, String content);
}
