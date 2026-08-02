package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    List<CategoryResponse> getCategoryTree();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
