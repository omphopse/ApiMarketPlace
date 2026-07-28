package com.marketplace.mapper;

import org.springframework.stereotype.Component;

import com.marketplace.dto.CategoryRequest;
import com.marketplace.dto.CategoryResponse;
import com.marketplace.entity.Category;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {

        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }

    public CategoryResponse toResponse(Category category) {

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}