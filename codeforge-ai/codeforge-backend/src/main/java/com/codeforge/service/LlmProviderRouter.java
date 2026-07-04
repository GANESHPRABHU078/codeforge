package com.codeforge.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Picks the active LlmClientService implementation based on
 * the "llm.provider" config property (GEMINI or GROQ).
 * This is the Strategy pattern in action.
 */
@Service
public class LlmProviderRouter {

    @Value("${llm.provider}")
    private String activeProvider;

    private final List<LlmClientService> providers;

    public LlmProviderRouter(List<LlmClientService> providers) {
        this.providers = providers;
    }

    public LlmClientService getActiveClient() {
        return providers.stream()
                .filter(p -> p.providerName().equalsIgnoreCase(activeProvider))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No LLM provider configured for: " + activeProvider));
    }
}
