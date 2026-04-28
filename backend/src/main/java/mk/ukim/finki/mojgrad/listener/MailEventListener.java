package mk.ukim.finki.mojgrad.listener;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.mojgrad.events.InviteUserEvent;
import mk.ukim.finki.mojgrad.service.TemplateFactory;
import mk.ukim.finki.mojgrad.service.intf.MailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class MailEventListener {

    private final TemplateFactory templateFactory;
    private final MailService mailService;

    @Async
    @EventListener
    public void onInviteUser(InviteUserEvent event) {
        Map<String, Object> templateModel = Map.of(
                "inviteToken", event.token()
        );

        String html = templateFactory.render("invite-user-email", templateModel);

        mailService.sendEmail(
                event.email(),
                "МојГрад - Административен работник покана",
                html
        );
    }
}