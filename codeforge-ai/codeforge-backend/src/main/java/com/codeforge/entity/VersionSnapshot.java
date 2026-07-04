package com.codeforge.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "version_snapshots")
public class VersionSnapshot {

    @Id
    private String id;

    private String projectId;
    private int versionNumber;
    private String changeSummary;
    private List<FileSnapshot> files;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileSnapshot {
        private String fileName;
        private String filePath;
        private String content;
        private String language;
    }
}
