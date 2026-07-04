package com.codeforge.prompt;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Loads prompt templates from classpath (src/main/resources/prompt/templates)
 * and fills placeholders like {{user_requirement}} at runtime.
 *
 * This centralizes every prompt used by the system, implementing the
 * "Prompt Template" pattern referenced in the project design.
 */
@Component
public class PromptTemplateRegistry {

    public enum TemplateName {
        CODE_GENERATION("prompt/templates/code_generation.txt"),
        SELF_REFLECTION("prompt/templates/self_reflection.txt"),
        EXPLAIN_CODE("prompt/templates/explain_code.txt"),
        GENERATE_TESTS("prompt/templates/generate_tests.txt"),
        GENERATE_DOCS("prompt/templates/generate_docs.txt"),
        DETECT_ERRORS("prompt/templates/detect_errors.txt"),
        REFACTOR("prompt/templates/refactor.txt"),
        QUALITY_SUGGESTIONS("prompt/templates/quality_suggestions.txt"),
        DEPLOYMENT_SUGGESTIONS("prompt/templates/deployment_suggestions.txt"),
        CHAT_WITH_CODE("prompt/templates/chat_with_code.txt");

        private final String path;
        TemplateName(String path) { this.path = path; }
        public String getPath() { return path; }
    }

    private final Map<TemplateName, String> cache = new ConcurrentHashMap<>();

    public String render(TemplateName name, Map<String, String> variables) {
        String template = cache.computeIfAbsent(name, this::loadTemplate);
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}",
                    entry.getValue() == null ? "" : entry.getValue());
        }
        return result;
    }

    private String loadTemplate(TemplateName name) {
        try (var is = new ClassPathResource(name.getPath()).getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Could not load prompt template: " + name.getPath(), e);
        }
    }
}
