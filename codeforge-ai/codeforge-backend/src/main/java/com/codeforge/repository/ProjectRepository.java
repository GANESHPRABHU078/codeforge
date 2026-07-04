package com.codeforge.repository;

import com.codeforge.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends MongoRepository<Project, String> {
    Page<Project> findByUserId(String userId, Pageable pageable);
    Optional<Project> findByIdAndUserId(String id, String userId);
    List<Project> findByUserIdAndTitleContainingIgnoreCase(String userId, String title);
}
