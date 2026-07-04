package com.codeforge.service;

import com.codeforge.exception.CustomExceptions.LlmApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiClientService implements LlmClientService {

    @Value("${llm.gemini.api-key}")
    private String apiKey;

    @Value("${llm.gemini.model}")
    private String model;

    @Value("${llm.gemini.base-url}")
    private String baseUrl;

    private final WebClient.Builder webClientBuilder;

    public GeminiClientService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public String generate(String prompt) {
        try {
            WebClient client = webClientBuilder.baseUrl(baseUrl).build();

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                    "temperature", 0.3,
                    "maxOutputTokens", 4096
                )
            );

            Map<?, ?> response = client.post()
                .uri(uriBuilder -> uriBuilder
                    .path("/models/{model}:generateContent")
                    .queryParam("key", apiKey)
                    .build(model))
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            return extractText(response);
        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new LlmApiException("Gemini API call failed: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> response) {
        try {
            List<?> candidates = (List<?>) response.get("candidates");
            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            return (String) firstPart.get("text");
        } catch (Exception e) {
            throw new LlmApiException("Unexpected Gemini response shape", e);
        }
    }

    @Override
    public String providerName() {
        return "GEMINI";
    }
}
