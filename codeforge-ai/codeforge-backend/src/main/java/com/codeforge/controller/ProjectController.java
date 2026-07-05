package com.codeforge.controller;

import com.codeforge.dto.response.ProjectSummaryResponse;
import com.codeforge.entity.Project;
import com.codeforge.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<Page<ProjectSummaryResponse>> listProjects(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(projectService.listProjects(user.getUsername(), page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProjectSummaryResponse>> search(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam String q) {
        return ResponseEntity.ok(projectService.searchProjects(user.getUsername(), q));
    }

    /** Recent projects (last N) — GET /api/projects/recent */
    @GetMapping("/recent")
    public ResponseEntity<List<ProjectSummaryResponse>> recent(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(projectService.getRecentProjects(user.getUsername(), limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id) {
        return ResponseEntity.ok(projectService.getProjectOrThrow(id, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id) {
        projectService.deleteProject(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadProjectZip(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id) {
        byte[] zip = projectService.exportProjectAsZip(id, user.getUsername());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"project-" + id + ".zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zip);
    }

    /** Toggle favorite — PATCH /api/projects/{id}/favorite */
    @PatchMapping("/{id}/favorite")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String id) {
        boolean isFav = projectService.toggleFavorite(id, user.getUsername());
        return ResponseEntity.ok(Map.of("favorite", isFav, "projectId", id));
    }
}
