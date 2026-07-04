package com.codeforge.service;

import com.codeforge.entity.Project;
import com.codeforge.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QualityAndDeploymentService {

    private final CodeContextService codeContextService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;
    private final ProjectRepository projectRepository;

    /** Returns raw JSON: {"suggestions":[{"category","description","priority"}]} */
    public String qualitySuggestions(String projectId, String fileName) {
        String code = codeContextService.getProjectCodeAsText(projectId, fileName);
        String prompt = promptEngineeringService.buildQualitySuggestionsPrompt(code);
        return llmProviderRouter.getActiveClient().generate(prompt);
    }

    /** Returns Markdown deployment recommendations. */
    public String deploymentSuggestions(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new com.codeforge.exception.CustomExceptions.ResourceNotFoundException(
                        "Project not found: " + projectId));

        String techStack = project.getTechStack() == null ? "Java, Spring Boot, React, MongoDB"
                : String.join(", ", project.getTechStack());

        String prompt = promptEngineeringService.buildDeploymentSuggestionsPrompt(
                project.getOriginalRequirement(), techStack);
        return llmProviderRouter.getActiveClient().generate(prompt);
    }
}
