package com.codeforge.service;

import com.codeforge.dto.request.GenerateCodeRequest;
import com.codeforge.dto.response.GeneratedCodeResponse;
import com.codeforge.dto.response.GeneratedFileDto;
import com.codeforge.entity.*;
import com.codeforge.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Main orchestration service for the "Generate Code" flow:
 * RAG retrieval -> prompt build -> LLM call -> self-reflection ->
 * parse -> persist (Mongo + vector index) -> version snapshot.
 */
@Service
@RequiredArgsConstructor
public class CodeGenerationService {

    private final RagService ragService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;
    private final ObjectMapper objectMapper;

    private final ProjectRepository projectRepository;
    private final GeneratedFileRepository fileRepository;
    private final PromptHistoryRepository promptHistoryRepository;
    private final VersionRepository versionRepository;

    public GeneratedCodeResponse generateCode(GenerateCodeRequest request, String userId) {

        List<String> ragContext = ragService.retrieveContext(request.getRequirement(), userId, 4);

        // 1. Generate Architectural Project Blueprint
        String blueprintPrompt = promptEngineeringService.buildBlueprintPrompt(request, ragContext);
        String rawBlueprint = llmProviderRouter.getActiveClient().generate(blueprintPrompt);
        
        GeneratedBlueprint blueprint = parseBlueprint(rawBlueprint);

        // 2. Iteratively generate the complete code for each file in the blueprint
        List<GeneratedFileDto> generatedFiles = new java.util.ArrayList<>();
        for (BlueprintFile bf : blueprint.getFiles()) {
            try {
                String filePrompt = promptEngineeringService.buildFileContentPrompt(
                    request, rawBlueprint, bf.getFileName(), bf.getFilePath(), bf.getPurpose()
                );
                String rawCode = llmProviderRouter.getActiveClient().generate(filePrompt);
                String cleanedCode = stripMarkdownFences(rawCode);

                generatedFiles.add(GeneratedFileDto.builder()
                        .fileName(bf.getFileName())
                        .filePath(bf.getFilePath())
                        .content(cleanedCode)
                        .language(bf.getLanguageFromFile())
                        .build());
            } catch (Exception e) {
                // If a specific file fails to generate, do not crash the entire build — fallback with placeholder
                generatedFiles.add(GeneratedFileDto.builder()
                        .fileName(bf.getFileName())
                        .filePath(bf.getFilePath())
                        .content("// Error generating file content: " + e.getMessage())
                        .language(bf.getLanguageFromFile())
                        .build());
            }
        }

        GeneratedCodeResult result = new GeneratedCodeResult(generatedFiles, blueprint.getSummary());

        Project project = resolveProject(request, userId, result);
        int newVersion = persistFiles(project, result.getFiles());
        persistVersionSnapshot(project, result, newVersion);
        indexGeneratedFiles(result.getFiles(), userId, project.getId());
        recordPromptHistory(project, userId, request.getRequirement(), blueprintPrompt, result);

        return GeneratedCodeResponse.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .files(result.getFiles())
                .summary(result.getSummary())
                .version(newVersion)
                .build();
    }

    private Project resolveProject(GenerateCodeRequest request, String userId, GeneratedCodeResult result) {
        if (request.getProjectId() != null && !request.getProjectId().isBlank()) {
            return projectRepository.findByIdAndUserId(request.getProjectId(), userId)
                    .orElseGet(() -> createNewProject(request, userId));
        }
        return createNewProject(request, userId);
    }

    private Project createNewProject(GenerateCodeRequest request, String userId) {
        Project project = Project.builder()
                .userId(userId)
                .title(deriveTitle(request.getRequirement()))
                .originalRequirement(request.getRequirement())
                .techStack(request.getTechStack())
                .status("COMPLETED")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return projectRepository.save(project);
    }

    private String deriveTitle(String requirement) {
        String trimmed = requirement.trim();
        return trimmed.length() > 60 ? trimmed.substring(0, 60) + "..." : trimmed;
    }

    private int persistFiles(Project project, List<GeneratedFileDto> files) {
        List<GeneratedFile> existing = fileRepository.findByProjectId(project.getId());
        int nextVersion = existing.isEmpty() ? 1
                : existing.stream().mapToInt(GeneratedFile::getVersion).max().orElse(0) + 1;

        List<GeneratedFile> toSave = files.stream()
                .map(f -> GeneratedFile.builder()
                        .projectId(project.getId())
                        .fileName(f.getFileName())
                        .filePath(f.getFilePath())
                        .content(f.getContent())
                        .language(f.getLanguage())
                        .version(nextVersion)
                        .createdAt(Instant.now())
                        .build())
                .toList();

        fileRepository.saveAll(toSave);
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
        return nextVersion;
    }

    private void persistVersionSnapshot(Project project, GeneratedCodeResult result, int versionNumber) {
        List<VersionSnapshot.FileSnapshot> snapshots = result.getFiles().stream()
                .map(f -> VersionSnapshot.FileSnapshot.builder()
                        .fileName(f.getFileName())
                        .filePath(f.getFilePath())
                        .content(f.getContent())
                        .language(f.getLanguage())
                        .build())
                .toList();

        VersionSnapshot snapshot = VersionSnapshot.builder()
                .projectId(project.getId())
                .versionNumber(versionNumber)
                .changeSummary(result.getSummary())
                .files(snapshots)
                .createdAt(Instant.now())
                .build();

        versionRepository.save(snapshot);
    }

    private void indexGeneratedFiles(List<GeneratedFileDto> files, String userId, String projectId) {
        for (GeneratedFileDto file : files) {
            ragService.indexContent(file.getContent(), userId, projectId, file.getFileName(), file.getLanguage());
        }
    }

    private void recordPromptHistory(Project project, String userId, String rawInput,
                                      String engineeredPrompt, GeneratedCodeResult result) {
        PromptHistory history = PromptHistory.builder()
                .projectId(project.getId())
                .userId(userId)
                .rawUserInput(rawInput)
                .engineeredPrompt(engineeredPrompt)
                .promptType("CODE_GENERATION")
                .llmProvider(llmProviderRouter.getActiveClient().providerName())
                .responseSummary(result.getSummary())
                .tokensUsed(0) // wire up real token accounting once provider returns usage stats
                .createdAt(Instant.now())
                .build();

        promptHistoryRepository.save(history);
    }

    private GeneratedBlueprint parseBlueprint(String rawBlueprint) {
        String cleaned = stripMarkdownFences(rawBlueprint);
        try {
            return objectMapper.readValue(cleaned, GeneratedBlueprint.class);
        } catch (Exception e) {
            // Fallback: create a basic plan if LLM failed to output correct JSON
            return GeneratedBlueprint.builder()
                .title("Software System")
                .summary("Generated system blueprint (fallback plan).")
                .files(List.of(
                    new BlueprintFile("README.md", ".", "Project documentation and setup guide"),
                    new BlueprintFile("App.java", "src/main/java/com/codeforge", "Main Spring Boot entry point")
                ))
                .build();
        }
    }

    private String stripMarkdownFences(String text) {
        if (text == null) return "";
        return text.replaceAll("(?s)```[a-zA-Z0-9-]*\\s*", "")
                   .replaceAll("(?s)```\\s*", "")
                   .trim();
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    private static class GeneratedBlueprint {
        private String title;
        private String summary;
        private List<BlueprintFile> files;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    private static class BlueprintFile {
        private String fileName;
        private String filePath;
        private String purpose;

        public String getLanguageFromFile() {
            if (fileName == null) return "text";
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".java")) return "java";
            if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "javascript";
            if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
            if (lower.endsWith(".py")) return "python";
            if (lower.endsWith(".html")) return "html";
            if (lower.endsWith(".css")) return "css";
            if (lower.endsWith(".json")) return "json";
            if (lower.endsWith(".xml")) return "xml";
            if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
            if (lower.endsWith(".sh")) return "shell";
            if (lower.endsWith(".sql")) return "sql";
            if (lower.endsWith("dockerfile")) return "dockerfile";
            return "text";
        }
    }
}
