package com.codeforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class GenerateCodeRequest {

    @NotBlank(message = "Requirement text is required")
    private String requirement;

    private List<String> techStack;

    // optional: continue generating within an existing project
    private String projectId;
}
