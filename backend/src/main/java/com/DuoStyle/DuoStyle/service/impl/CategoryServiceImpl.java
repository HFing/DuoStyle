package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import com.DuoStyle.DuoStyle.entity.Category;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CategoryRepository;
import com.DuoStyle.DuoStyle.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<CategoryResponse> getCategoryTree() {
        List<Category> allCategories = categoryRepository.findAll();
        List<Category> rootCategories = allCategories.stream()
                .filter(c -> c.getParentCategory() == null)
                .toList();
        return rootCategories.stream().map(c -> mapToTreeResponse(c, allCategories)).toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Category not found"));
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId()).orElse(null);
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .genderTarget(request.getGenderTarget())
                .parentCategory(parent)
                .build();

        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Category not found"));

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId()).orElse(null);
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setGenderTarget(request.getGenderTarget());
        category.setParentCategory(parent);

        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .genderTarget(category.getGenderTarget())
                .parentId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .build();
    }

    private CategoryResponse mapToTreeResponse(Category category, List<Category> allCategories) {
        List<Category> childCategories = allCategories.stream()
                .filter(c -> c.getParentCategory() != null && c.getParentCategory().getId().equals(category.getId()))
                .toList();

        List<CategoryResponse> subResponses = childCategories.isEmpty() ? Collections.emptyList() :
                childCategories.stream().map(c -> mapToTreeResponse(c, allCategories)).toList();

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .genderTarget(category.getGenderTarget())
                .parentId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .parentName(category.getParentCategory() != null ? category.getParentCategory().getName() : null)
                .subCategories(subResponses)
                .build();
    }
}
