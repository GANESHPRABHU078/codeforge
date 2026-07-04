package com.codeforge.service;

import com.codeforge.dto.request.GenerateCodeRequest;
import com.codeforge.dto.response.GeneratedFileDto;
import com.codeforge.exception.CustomExceptions.LlmOutputParseException;
import com.codeforge.prompt.PromptTemplateRegistry;
import com.codeforge.prompt.PromptTemplateRegistry.TemplateName;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The heart of the "prompt engineering" layer: builds structured prompts
 * (role prompting + few-shot + context injection + output-format constraints),
 * runs the self-reflection correction pass, and parses structured LLM output.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PromptEngineeringService {

    private final PromptTemplateRegistry templateRegistry;
    private final LlmProviderRouter llmProviderRouter;
    private final ObjectMapper objectMapper;

    public String buildCodeGenPrompt(GenerateCodeRequest request, List<String> ragContext) {
        Map<String, String> vars = new HashMap<>();
        vars.put("user_requirement", request.getRequirement());
        vars.put("tech_stack", request.getTechStack() == null ? "Java, Spring Boot, React, MongoDB"
                : String.join(", ", request.getTechStack()));
        vars.put("rag_context", ragContext.isEmpty() ? "(no prior related context found)"
                : String.join("\n---\n", ragContext));

        return templateRegistry.render(TemplateName.CODE_GENERATION, vars);
    }

    /** Runs a second LLM pass that reviews and corrects the first output. */
    public String applySelfReflection(String rawGeneratedJson) {
        Map<String, String> vars = Map.of("generated_code_json", rawGeneratedJson);
        String reflectionPrompt = templateRegistry.render(TemplateName.SELF_REFLECTION, vars);

        try {
            return llmProviderRouter.getActiveClient().generate(reflectionPrompt);
        } catch (Exception e) {
            // if reflection call fails, fall back to the original output rather than failing the request
            log.warn("Self-reflection pass failed, returning original output: {}", e.getMessage());
            return rawGeneratedJson;
        }
    }

    public GeneratedCodeResult parseJsonOutput(String llmOutput) {
        String cleaned = stripMarkdownFences(llmOutput);
        try {
            Map<?, ?> parsed = objectMapper.readValue(cleaned, Map.class);
            List<GeneratedFileDto> files = objectMapper.convertValue(
                    parsed.get("files"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, GeneratedFileDto.class));
            Object summaryValue = parsed.get("summary");
            String summary = summaryValue == null ? "" : summaryValue.toString();
            return new GeneratedCodeResult(files, summary);
        } catch (Exception e) {
            throw new LlmOutputParseException("Could not parse LLM output as structured JSON: " + e.getMessage());
        }
    }

    private String stripMarkdownFences(String text) {
        return text.replaceAll("(?s)```json\\s*", "")
                   .replaceAll("(?s)```\\s*", "")
                   .trim();
    }

    // --- Templates for secondary agents ---

    public String buildExplainPrompt(String codeContent) {
        return templateRegistry.render(TemplateName.EXPLAIN_CODE, Map.of("code_content", codeContent));
    }

    public String buildTestGenPrompt(String codeContent) {
        return templateRegistry.render(TemplateName.GENERATE_TESTS, Map.of("code_content", codeContent));
    }

    public String buildDocGenPrompt(String codeContent) {
        return templateRegistry.render(TemplateName.GENERATE_DOCS, Map.of("code_content", codeContent));
    }

    public String buildErrorDetectPrompt(String codeContent) {
        return templateRegistry.render(TemplateName.DETECT_ERRORS, Map.of("code_content", codeContent));
    }

    public String buildRefactorPrompt(String codeContent) {
        return templateRegistry.render(TemplateName.REFACTOR, Map.of("code_content", codeContent));
    }

    public String buildQualitySuggestionsPrompt(String codeContent) {
        return templateRegistry.render(TemplateName.QUALITY_SUGGESTIONS, Map.of("code_content", codeContent));
    }

    public String buildDeploymentSuggestionsPrompt(String projectSummary, String techStack) {
        return templateRegistry.render(TemplateName.DEPLOYMENT_SUGGESTIONS,
                Map.of("project_summary", projectSummary, "tech_stack", techStack));
    }

    public String buildChatPrompt(List<String> ragContext, String chatHistory, String userMessage) {
        Map<String, String> vars = new HashMap<>();
        vars.put("rag_context", ragContext.isEmpty() ? "(no relevant context found)" : String.join("\n---\n", ragContext));
        vars.put("chat_history", chatHistory);
        vars.put("user_message", userMessage);
        return templateRegistry.render(TemplateName.CHAT_WITH_CODE, vars);
    }
}
