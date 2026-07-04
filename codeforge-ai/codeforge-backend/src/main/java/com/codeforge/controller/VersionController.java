package com.codeforge.controller;

import com.codeforge.entity.VersionSnapshot;
import com.codeforge.exception.CustomExceptions.ResourceNotFoundException;
import com.codeforge.repository.GeneratedFileRepository;
import com.codeforge.repository.VersionRepository;
import com.codeforge.entity.GeneratedFile;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{id}/versions")
@RequiredArgsConstructor
public class VersionController {

    private final VersionRepository versionRepository;
    private final GeneratedFileRepository fileRepository;

    @GetMapping
    public ResponseEntity<List<VersionSnapshot>> listVersions(@PathVariable String id) {
        return ResponseEntity.ok(versionRepository.findByProjectIdOrderByVersionNumberDesc(id));
    }

    @GetMapping("/{versionNumber}")
    public ResponseEntity<VersionSnapshot> getVersion(@PathVariable String id, @PathVariable int versionNumber) {
        VersionSnapshot snapshot = versionRepository.findByProjectIdAndVersionNumber(id, versionNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Version not found"));
        return ResponseEntity.ok(snapshot);
    }

    @PostMapping("/{versionNumber}/restore")
    public ResponseEntity<Void> restoreVersion(@PathVariable String id, @PathVariable int versionNumber) {
        VersionSnapshot snapshot = versionRepository.findByProjectIdAndVersionNumber(id, versionNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Version not found"));

        fileRepository.deleteByProjectId(id);

        List<GeneratedFile> restored = snapshot.getFiles().stream()
                .map(f -> GeneratedFile.builder()
                        .projectId(id)
                        .fileName(f.getFileName())
                        .filePath(f.getFilePath())
                        .content(f.getContent())
                        .language(f.getLanguage())
                        .version(versionNumber)
                        .createdAt(Instant.now())
                        .build())
                .toList();

        fileRepository.saveAll(restored);
        return ResponseEntity.ok().build();
    }
}
