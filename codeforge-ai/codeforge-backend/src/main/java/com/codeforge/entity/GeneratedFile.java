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
@Document(collection = "generated_files")
public class GeneratedFile {

    @Id
    private String id;

    private String projectId;
    private String fileName;
    private String filePath;
    private String content;
    private String language;

    @Builder.Default
    private int version = 1;

    private Instant createdAt;
}
