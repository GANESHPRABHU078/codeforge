package com.codeforge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocGenerationService {

    private final CodeContextService codeContextService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;

    /** Returns raw Markdown documentation (not JSON, since it's meant to be read directly). */
    public String generateDocs(String projectId, String fileName) {
        String code = codeContextService.getProjectCodeAsText(projectId, fileName);
        String prompt = promptEngineeringService.buildDocGenPrompt(code);
        return llmProviderRouter.getActiveClient().generate(prompt);
    }
}
