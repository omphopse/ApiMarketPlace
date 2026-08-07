package com.marketplace.repository;

import com.marketplace.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<Category, Long> {
    List<Category> findByActiveTrueOrderByNameAsc();
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
}
