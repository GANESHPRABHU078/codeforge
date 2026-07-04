package com.codeforge.controller;

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
}
