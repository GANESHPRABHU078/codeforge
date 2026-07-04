package com.codeforge.service;

import com.codeforge.dto.request.GenerateCodeRequest;
import com.codeforge.dto.response.GeneratedCodeResponse;
import com.codeforge.dto.response.GeneratedFileDto;
import com.codeforge.entity.*;
import com.codeforge.repository.*;
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

    private final ProjectRepository projectRepository;
    private final GeneratedFileRepository fileRepository;
    private final PromptHistoryRepository promptHistoryRepository;
    private final VersionRepository versionRepository;

    public GeneratedCodeResponse generateCode(GenerateCodeRequest request, String userId) {

        List<String> ragContext = ragService.retrieveContext(request.getRequirement(), userId, 4);

        String prompt = promptEngineeringService.buildCodeGenPrompt(request, ragContext);
        String rawOutput = llmProviderRouter.getActiveClient().generate(prompt);
        String reflectedOutput = promptEngineeringService.applySelfReflection(rawOutput);

        GeneratedCodeResult result = promptEngineeringService.parseJsonOutput(reflectedOutput);

        Project project = resolveProject(request, userId, result);
        int newVersion = persistFiles(project, result.getFiles());
        persistVersionSnapshot(project, result, newVersion);
        indexGeneratedFiles(result.getFiles(), userId, project.getId());
        recordPromptHistory(project, userId, request.getRequirement(), prompt, result);

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
}
