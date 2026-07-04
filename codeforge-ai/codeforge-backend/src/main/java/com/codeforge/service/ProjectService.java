package com.codeforge.service;

import com.codeforge.dto.response.ProjectSummaryResponse;
import com.codeforge.entity.GeneratedFile;
import com.codeforge.entity.Project;
import com.codeforge.exception.CustomExceptions.ResourceNotFoundException;
import com.codeforge.repository.GeneratedFileRepository;
import com.codeforge.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final GeneratedFileRepository fileRepository;
    private final ZipExportService zipExportService;

    public Page<ProjectSummaryResponse> listProjects(String userId, int page, int size) {
        return projectRepository.findByUserId(userId, PageRequest.of(page, size))
                .map(this::toSummary);
    }

    public List<ProjectSummaryResponse> searchProjects(String userId, String titleQuery) {
        return projectRepository.findByUserIdAndTitleContainingIgnoreCase(userId, titleQuery)
                .stream().map(this::toSummary).toList();
    }

    public Project getProjectOrThrow(String projectId, String userId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
    }

    public void deleteProject(String projectId, String userId) {
        Project project = getProjectOrThrow(projectId, userId);
        fileRepository.deleteByProjectId(project.getId());
        projectRepository.delete(project);
    }

    public byte[] exportProjectAsZip(String projectId, String userId) {
        Project project = getProjectOrThrow(projectId, userId);
        List<GeneratedFile> files = fileRepository.findByProjectId(project.getId());
        return zipExportService.buildZip(files);
    }

    private ProjectSummaryResponse toSummary(Project project) {
        return ProjectSummaryResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .status(project.getStatus())
                .techStack(project.getTechStack())
                .tags(project.getTags())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
