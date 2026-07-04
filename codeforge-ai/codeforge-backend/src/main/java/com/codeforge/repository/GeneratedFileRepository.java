package com.codeforge.repository;

import com.codeforge.entity.GeneratedFile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GeneratedFileRepository extends MongoRepository<GeneratedFile, String> {
    List<GeneratedFile> findByProjectId(String projectId);
    void deleteByProjectId(String projectId);
}
