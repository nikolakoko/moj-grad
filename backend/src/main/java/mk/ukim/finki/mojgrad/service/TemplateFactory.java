package mk.ukim.finki.mojgrad.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class TemplateFactory {

    private final SpringTemplateEngine templateEngine;

    public String render(String templateName, Map<String, Object> templateModel) {
        Context ctx = new Context(Locale.ENGLISH);
        templateModel.forEach(ctx::setVariable);
        return templateEngine.process(templateName, ctx);
    }
}
