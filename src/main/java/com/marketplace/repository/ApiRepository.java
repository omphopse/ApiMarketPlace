package com.marketplace.repository;

import com.marketplace.entity.Api;
import com.marketplace.entity.ApiStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApiRepository extends MongoRepository<Api, String> {
    List<Api> findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(String providerId);
    List<Api> findTop5ByProviderIdAndDeletedFalseOrderByCreatedAtDesc(String providerId);
    long countByProviderIdAndDeletedFalse(String providerId);
    long countByProviderIdAndStatusAndDeletedFalse(String providerId, ApiStatus status);
    List<Api> findByDeletedFalseOrderByCreatedAtDesc();
    List<Api> findByStatusAndDeletedFalseOrderByCreatedAtDesc(ApiStatus status);
    Optional<Api> findByIdAndDeletedFalse(String id);
    Optional<Api> findByIdAndProviderIdAndDeletedFalse(String id, String providerId);
}
