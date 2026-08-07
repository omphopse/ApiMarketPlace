package com.marketplace.repository;

import com.marketplace.entity.Api;
import com.marketplace.entity.ApiStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApiRepository extends MongoRepository<Api, Long> {
    List<Api> findByProviderIdAndDeletedFalseOrderByCreatedAtDesc(Long providerId);
    List<Api> findTop5ByProviderIdAndDeletedFalseOrderByCreatedAtDesc(Long providerId);
    long countByProviderIdAndDeletedFalse(Long providerId);
    long countByProviderIdAndStatusAndDeletedFalse(Long providerId, ApiStatus status);
    Optional<Api> findByIdAndDeletedFalse(Long id);
    Optional<Api> findByIdAndProviderIdAndDeletedFalse(Long id, Long providerId);
}
