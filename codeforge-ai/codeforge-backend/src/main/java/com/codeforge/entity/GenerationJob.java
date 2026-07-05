package com.codeforge.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "generation_jobs")
public class GenerationJob {

    @Id
    private String id;

    private String userId;
    private String requirement;

    /** PENDING → RUNNING → COMPLETED | FAILED */
    private String status;

    private String errorMessage;

    // Filled once complete — mirrors GenerateCodeResponse fields
    private String projectId;
    private String title;
    private String summary;
    private Integer version;

    private Instant createdAt;
    private Instant updatedAt;
}
