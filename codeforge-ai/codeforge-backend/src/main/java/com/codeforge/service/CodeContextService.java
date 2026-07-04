package com.codeforge.service;

import com.codeforge.entity.GeneratedFile;
import com.codeforge.repository.GeneratedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/** Shared helper: pulls a project's current code (or a single file) as one text blob for prompts. */
@Service
@RequiredArgsConstructor
public class CodeContextService {

    private final GeneratedFileRepository fileRepository;

    public String getProjectCodeAsText(String projectId, String fileNameFilter) {
        List<GeneratedFile> files = fileRepository.findByProjectId(projectId);

        if (fileNameFilter != null && !fileNameFilter.isBlank()) {
            files = files.stream()
                    .filter(f -> f.getFileName().equalsIgnoreCase(fileNameFilter))
                    .toList();
        }

        return files.stream()
                .map(f -> "// FILE: " + f.getFilePath() + f.getFileName() + "\n" + f.getContent())
                .collect(Collectors.joining("\n\n---\n\n"));
    }
}
