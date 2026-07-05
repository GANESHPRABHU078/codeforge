package com.codeforge.repository;

import com.codeforge.entity.GenerationJob;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenerationJobRepository extends MongoRepository<GenerationJob, String> {
}
