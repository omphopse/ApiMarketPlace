package com.marketplace.service;

import java.util.List;

import com.marketplace.dto.CategoryRequest;
import com.marketplace.dto.CategoryResponse;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

}