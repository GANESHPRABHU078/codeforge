package com.codeforge.service;

import com.codeforge.dto.response.GeneratedFileDto;
import com.codeforge.dto.response.ProjectDetailResponse;
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
import java.time.Instant;

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

    /**
     * Returns full project detail including the latest-version generated files.
     * Used by GET /api/projects/{id} so the frontend file tree is populated.
     */
    public ProjectDetailResponse getProjectDetail(String projectId, String userId) {
        Project project = getProjectOrThrow(projectId, userId);

        // Fetch all files and keep only the highest (latest) version
        List<GeneratedFile> allFiles = fileRepository.findByProjectId(projectId);
        int latestVersion = allFiles.stream()
                .mapToInt(GeneratedFile::getVersion)
                .max().orElse(1);
        List<GeneratedFileDto> files = allFiles.stream()
                .filter(f -> f.getVersion() == latestVersion)
                .map(f -> GeneratedFileDto.builder()
                        .fileName(f.getFileName())
                        .filePath(f.getFilePath())
                        .content(f.getContent())
                        .language(f.getLanguage())
                        .build())
                .toList();

        return ProjectDetailResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .originalRequirement(project.getOriginalRequirement())
                .status(project.getStatus())
                .techStack(project.getTechStack())
                .tags(project.getTags())
                .summary(project.getSummary())
                .favorite(project.isFavorite())
                .version(latestVersion)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .files(files)
                .build();
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

    /** Toggle favorite flag on a project. Returns updated favorite state. */
    public boolean toggleFavorite(String projectId, String userId) {
        Project project = getProjectOrThrow(projectId, userId);
        project.setFavorite(!project.isFavorite());
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
        return project.isFavorite();
    }

    /** Return the most recent N projects for a user. */
    public List<ProjectSummaryResponse> getRecentProjects(String userId, int limit) {
        return projectRepository.findByUserId(userId, PageRequest.of(0, limit))
                .stream().map(this::toSummary).toList();
    }

    /** Count total projects for a user. */
    public long countProjects(String userId) {
        return projectRepository.countByUserId(userId);
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
