package com.codeforge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ErrorDetectionService {

    private final CodeContextService codeContextService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;

    /** Returns raw JSON: {"issues":[{"file","severity","description","suggestedFix"}]} */
    public String detectErrors(String projectId, String fileName) {
        String code = codeContextService.getProjectCodeAsText(projectId, fileName);
        String prompt = promptEngineeringService.buildErrorDetectPrompt(code);
        return llmProviderRouter.getActiveClient().generate(prompt);
    }
}
