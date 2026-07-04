package com.codeforge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefactorService {

    private final CodeContextService codeContextService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;

    public GeneratedCodeResult refactor(String projectId, String fileName) {
        String code = codeContextService.getProjectCodeAsText(projectId, fileName);
        String prompt = promptEngineeringService.buildRefactorPrompt(code);
        String output = llmProviderRouter.getActiveClient().generate(prompt);
        return promptEngineeringService.parseJsonOutput(output);
    }
}
