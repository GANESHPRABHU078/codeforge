package com.codeforge.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Talks to the vector-service (ChromaDB wrapper) for indexing and
 * retrieval of code embeddings — the RAG piece of the pipeline.
 */
@Slf4j
@Service
public class RagService {

    @Value("${vector-service.base-url}")
    private String vectorServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public RagService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    /** Retrieve top-k relevant chunks for a query, scoped to a user. */
    @SuppressWarnings("unchecked")
    public List<String> retrieveContext(String query, String userId, int topK) {
        try {
            WebClient client = webClientBuilder.baseUrl(vectorServiceUrl).build();

            Map<String, Object> body = Map.of(
                "query", query,
                "user_id", userId,
                "top_k", topK
            );

            Map<?, ?> response = client.post()
                .uri("/query")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null || response.get("results") == null) return List.of();
            return (List<String>) response.get("results");
        } catch (Exception e) {
            // RAG is an enhancement, not a hard dependency — degrade gracefully
            log.warn("RAG retrieval failed, continuing without context: {}", e.getMessage());
            return List.of();
        }
    }

    /** Index a piece of generated code (chunked+embedded server-side by vector-service). */
    public void indexContent(String content, String userId, String projectId, String fileName, String language) {
        try {
            WebClient client = webClientBuilder.baseUrl(vectorServiceUrl).build();

            Map<String, Object> body = Map.of(
                "content", content,
                "user_id", userId,
                "project_id", projectId,
                "file_name", fileName,
                "language", language
            );

            client.post()
                .uri("/embed")
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .block();
        } catch (Exception e) {
            log.warn("RAG indexing failed (non-fatal): {}", e.getMessage());
        }
    }
}
