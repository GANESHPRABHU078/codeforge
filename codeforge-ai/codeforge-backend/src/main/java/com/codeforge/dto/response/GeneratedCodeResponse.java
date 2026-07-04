package com.codeforge.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedCodeResponse {
    private String projectId;
    private String title;
    private List<GeneratedFileDto> files;
    private String summary;
    private int version;
}
