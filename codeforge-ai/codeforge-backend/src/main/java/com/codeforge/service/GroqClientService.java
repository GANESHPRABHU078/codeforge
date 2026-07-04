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
public class GroqClientService implements LlmClientService {

    @Value("${llm.groq.api-key}")
    private String apiKey;

    @Value("${llm.groq.model}")
    private String model;

    @Value("${llm.groq.base-url}")
    private String baseUrl;

    private final WebClient.Builder webClientBuilder;

    public GroqClientService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public String generate(String prompt) {
        try {
            WebClient client = webClientBuilder.baseUrl(baseUrl).build();

            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "temperature", 0.3
            );

            Map<?, ?> response = client.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            return extractText(response);
        } catch (Exception e) {
            log.error("Groq API call failed", e);
            throw new LlmApiException("Groq API call failed: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            throw new LlmApiException("Unexpected Groq response shape", e);
        }
    }

    @Override
    public String providerName() {
        return "GROQ";
    }
}
