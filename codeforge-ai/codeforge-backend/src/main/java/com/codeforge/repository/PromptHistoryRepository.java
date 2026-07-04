package com.codeforge.repository;

import com.codeforge.entity.PromptHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PromptHistoryRepository extends MongoRepository<PromptHistory, String> {
    List<PromptHistory> findByProjectIdOrderByCreatedAtDesc(String projectId);
    List<PromptHistory> findByUserIdOrderByCreatedAtDesc(String userId);
}
