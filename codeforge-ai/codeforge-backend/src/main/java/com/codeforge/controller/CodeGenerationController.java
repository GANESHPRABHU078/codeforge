package com.codeforge.controller;

import com.codeforge.dto.request.ActionOnProjectRequest;
import com.codeforge.dto.request.GenerateCodeRequest;
import com.codeforge.dto.response.GeneratedCodeResponse;
import com.codeforge.entity.GenerationJob;
import com.codeforge.repository.GenerationJobRepository;
import com.codeforge.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
public class CodeGenerationController {

    private final CodeGenerationService codeGenerationService;
    private final TestGenerationService testGenerationService;
    private final DocGenerationService docGenerationService;
    private final ErrorDetectionService errorDetectionService;
    private final RefactorService refactorService;
    private final QualityAndDeploymentService qualityAndDeploymentService;
    private final CodeContextService codeContextService;
    private final PromptEngineeringService promptEngineeringService;
    private final LlmProviderRouter llmProviderRouter;
    private final GenerationJobRepository jobRepository;

    /** Returns jobId immediately; runs generation in background thread. */
    @PostMapping("/code")
    public ResponseEntity<Map<String, String>> generateCode(
            @Valid @RequestBody GenerateCodeRequest request,
            @AuthenticationPrincipal UserDetails user) {
        GenerationJob job = codeGenerationService.submitAsync(request, user.getUsername());
        return ResponseEntity.accepted().body(Map.of("jobId", job.getId(), "status", "PENDING"));
    }

    /** Poll this endpoint to check generation progress. */
    @GetMapping("/status/{jobId}")
    public ResponseEntity<?> getJobStatus(
            @PathVariable String jobId,
            @AuthenticationPrincipal UserDetails user) {
        return jobRepository.findById(jobId)
                .map(job -> {
                    if ("COMPLETED".equals(job.getStatus())) {
                        return ResponseEntity.ok(Map.of(
                                "status", job.getStatus(),
                                "projectId", job.getProjectId(),
                                "title",     job.getTitle() != null ? job.getTitle() : "",
                                "summary",   job.getSummary() != null ? job.getSummary() : "",
                                "version",   job.getVersion() != null ? job.getVersion() : 1
                        ));
                    }
                    return ResponseEntity.ok(Map.of(
                            "status",  job.getStatus(),
                            "error",   job.getErrorMessage() != null ? job.getErrorMessage() : ""
                    ));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/explain")
    public ResponseEntity<String> explain(@Valid @RequestBody ActionOnProjectRequest request) {
        String code = codeContextService.getProjectCodeAsText(request.getProjectId(), request.getFileName());
        String prompt = promptEngineeringService.buildExplainPrompt(code);
        return ResponseEntity.ok(llmProviderRouter.getActiveClient().generate(prompt));
    }

    @PostMapping("/tests")
    public ResponseEntity<GeneratedCodeResult> generateTests(@Valid @RequestBody ActionOnProjectRequest request) {
        return ResponseEntity.ok(testGenerationService.generateTests(request.getProjectId(), request.getFileName()));
    }

    @PostMapping("/docs")
    public ResponseEntity<String> generateDocs(@Valid @RequestBody ActionOnProjectRequest request) {
        return ResponseEntity.ok(docGenerationService.generateDocs(request.getProjectId(), request.getFileName()));
    }

    @PostMapping("/detect-errors")
    public ResponseEntity<String> detectErrors(@Valid @RequestBody ActionOnProjectRequest request) {
        return ResponseEntity.ok(errorDetectionService.detectErrors(request.getProjectId(), request.getFileName()));
    }

    @PostMapping("/refactor")
    public ResponseEntity<GeneratedCodeResult> refactor(@Valid @RequestBody ActionOnProjectRequest request) {
        return ResponseEntity.ok(refactorService.refactor(request.getProjectId(), request.getFileName()));
    }

    @PostMapping("/quality-suggestions")
    public ResponseEntity<String> qualitySuggestions(@Valid @RequestBody ActionOnProjectRequest request) {
        return ResponseEntity.ok(qualityAndDeploymentService.qualitySuggestions(request.getProjectId(), request.getFileName()));
    }

    @PostMapping("/deployment-suggestions")
    public ResponseEntity<String> deploymentSuggestions(@Valid @RequestBody ActionOnProjectRequest request) {
        return ResponseEntity.ok(qualityAndDeploymentService.deploymentSuggestions(request.getProjectId()));
    }
}
