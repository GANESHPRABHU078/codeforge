package com.codeforge.controller;

import com.codeforge.dto.request.RegisterRequest;
import com.codeforge.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final MongoTemplate mongoTemplate;
    private final AuthService authService;

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
}
