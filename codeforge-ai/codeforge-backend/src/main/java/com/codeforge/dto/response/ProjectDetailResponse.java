package com.codeforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Full project detail: project metadata + its latest generated files.
 * Returned by GET /api/projects/{id} so the frontend can show the file tree.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailResponse {

    // ── Project fields ──────────────────────────────────────────────────────
    private String id;
    private String title;
    private String originalRequirement;
    private String status;
    private List<String> techStack;
    private List<String> tags;
    private String summary;
    private boolean favorite;
    private int version;
    private Instant createdAt;
    private Instant updatedAt;

    // ── Files ───────────────────────────────────────────────────────────────
    /** Latest-version files for this project (may be empty if generation failed). */
    private List<GeneratedFileDto> files;
}
