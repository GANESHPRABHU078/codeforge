package com.codeforge.controller;

import com.codeforge.dto.request.RegisterRequest;
import com.codeforge.repository.GeneratedFileRepository;
import com.codeforge.service.AuthService;
import com.codeforge.service.LlmProviderRouter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final MongoTemplate mongoTemplate;
    private final AuthService authService;
    private final GeneratedFileRepository generatedFileRepository;
    private final LlmProviderRouter llmProviderRouter;

    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> testDbConnection() {
        Map<String, Object> status = new HashMap<>();
        try {
            String dbName = mongoTemplate.getDb().getName();
            status.put("connected", true);
            status.put("databaseName", dbName);
            status.put("collections", mongoTemplate.getCollectionNames());
        } catch (Exception e) {
            status.put("connected", false);
            status.put("errorClass", e.getClass().getName());
            status.put("errorMessage", e.getMessage());
            
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            status.put("stackTrace", sw.toString());
        }
        return ResponseEntity.ok(status);
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.codeforge.security.JwtUtil jwtUtil;

    @GetMapping("/jwt")
    public ResponseEntity<Map<String, Object>> testJwt() {
        Map<String, Object> status = new HashMap<>();
        try {
            String token = jwtUtil.generateAccessToken("test@gmail.com");
            status.put("success", true);
            status.put("generatedToken", token);
        } catch (Exception e) {
            status.put("success", false);
            status.put("errorClass", e.getClass().getName());
            status.put("errorMessage", e.getMessage());
            
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            status.put("stackTrace", sw.toString());
        }
        return ResponseEntity.ok(status);
    }

    @GetMapping("/register-test")
    public ResponseEntity<Map<String, Object>> testRegister() {
        Map<String, Object> status = new HashMap<>();
        try {
            RegisterRequest req = new RegisterRequest();
            req.setFullName("Debug User");
            req.setEmail("debug_test_" + System.currentTimeMillis() + "@test.com");
            req.setPassword("Debug@1234");
            var result = authService.register(req);
            status.put("success", true);
            status.put("email", result.getEmail());
            status.put("hasToken", result.getAccessToken() != null);
        } catch (Exception e) {
            status.put("success", false);
            status.put("errorClass", e.getClass().getName());
            status.put("errorMessage", e.getMessage());
            // Full chain
            Throwable cause = e.getCause();
            if (cause != null) {
                status.put("causeClass", cause.getClass().getName());
                status.put("causeMessage", cause.getMessage());
                Throwable root = cause.getCause();
                if (root != null) {
                    status.put("rootClass", root.getClass().getName());
                    status.put("rootMessage", root.getMessage());
                }
            }
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            status.put("stackTrace", sw.toString().substring(0, Math.min(2000, sw.toString().length())));
        }
        return ResponseEntity.ok(status);
    }
    /** Check files in MongoDB for a project — no auth, for debugging. */
    @GetMapping("/files/{projectId}")
    public ResponseEntity<Map<String, Object>> checkFiles(@PathVariable String projectId) {
        Map<String, Object> result = new HashMap<>();
        try {
            var files = generatedFileRepository.findByProjectId(projectId);
            result.put("projectId", projectId);
            result.put("fileCount", files.size());
            result.put("files", files.stream().map(f -> Map.of(
                "fileName", f.getFileName(),
                "filePath", f.getFilePath() != null ? f.getFilePath() : "",
                "language", f.getLanguage() != null ? f.getLanguage() : "",
                "version", f.getVersion(),
                "contentLength", f.getContent() != null ? f.getContent().length() : 0
            )).toList());
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    /** Test the active LLM provider with a tiny prompt — no auth, for debugging. */
    @GetMapping("/llm")
    public ResponseEntity<Map<String, Object>> testLlm() {
        Map<String, Object> result = new HashMap<>();
        try {
            String provider = llmProviderRouter.getActiveClient().providerName();
            String response = llmProviderRouter.getActiveClient().generate(
                "Reply with exactly this JSON and nothing else: {\"status\":\"ok\",\"provider\":\"" + provider + "\"}"
            );
            result.put("provider", provider);
            result.put("success", true);
            result.put("response", response);
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}
