package com.marketplace.notification.email;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {
    public String render(EmailEventType eventType, Map<String, String> variables) throws IOException {
        String templateName = eventType.name().toLowerCase().replace('_', '-') + ".html";
        ClassPathResource resource = new ClassPathResource("templates/email/" + templateName);
        try (InputStream inputStream = resource.getInputStream()) {
            String template = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            for (Map.Entry<String, String> variable : variables.entrySet()) {
                template = template.replace("{{" + variable.getKey() + "}}", escapeHtml(variable.getValue()));
            }
            return template;
        }
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}