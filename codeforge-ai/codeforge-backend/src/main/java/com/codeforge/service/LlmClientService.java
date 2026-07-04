package com.codeforge.service;

/**
 * Strategy interface for LLM providers. GeminiClientService and
 * GroqClientService both implement this; LlmProviderRouter picks the
 * active one based on the "llm.provider" property.
 */
public interface LlmClientService {
    String generate(String prompt);
    String providerName();
}
