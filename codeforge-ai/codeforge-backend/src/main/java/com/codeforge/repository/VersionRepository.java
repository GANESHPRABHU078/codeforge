package com.codeforge.repository;

import com.codeforge.entity.VersionSnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VersionRepository extends MongoRepository<VersionSnapshot, String> {
    List<VersionSnapshot> findByProjectIdOrderByVersionNumberDesc(String projectId);
    Optional<VersionSnapshot> findByProjectIdAndVersionNumber(String projectId, int versionNumber);
}
