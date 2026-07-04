package com.codeforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Generic request used by /explain, /tests, /docs, /detect-errors,
 * /refactor, /quality-suggestions, /deployment-suggestions endpoints.
 */
@Data
public class ActionOnProjectRequest {

    @NotBlank(message = "projectId is required")
    private String projectId;

    // optional: restrict the action to a single file
    private String fileName;
}
