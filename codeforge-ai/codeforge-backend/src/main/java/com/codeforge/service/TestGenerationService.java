package com.codeforge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestGenerationService {

    private final CodeContextService codeContextService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;

    public GeneratedCodeResult generateTests(String projectId, String fileName) {
        String code = codeContextService.getProjectCodeAsText(projectId, fileName);
        String prompt = promptEngineeringService.buildTestGenPrompt(code);
        String output = llmProviderRouter.getActiveClient().generate(prompt);
        return promptEngineeringService.parseJsonOutput(output);
    }
}
