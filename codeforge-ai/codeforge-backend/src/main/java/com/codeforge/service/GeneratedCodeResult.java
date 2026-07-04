package com.codeforge.service;

import com.codeforge.dto.response.GeneratedFileDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Parsed representation of the LLM's structured JSON output for code-gen actions. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeneratedCodeResult {
    private List<GeneratedFileDto> files;
    private String summary;
}
