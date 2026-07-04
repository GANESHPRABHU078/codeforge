package com.codeforge.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "prompt_history")
public class PromptHistory {

    @Id
    private String id;

    private String projectId;
    private String userId;
    private String rawUserInput;
    private String engineeredPrompt;

    // CODE_GENERATION, EXPLAIN, TEST, DOC, REFACTOR, ERROR_DETECT, QUALITY, DEPLOYMENT, CHAT
    private String promptType;

    private String llmProvider;
    private String responseSummary;
    private int tokensUsed;
    private Instant createdAt;
}
