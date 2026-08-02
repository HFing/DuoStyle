package com.DuoStyle.DuoStyle.category;

import com.DuoStyle.DuoStyle.controller.CategoryController;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import com.DuoStyle.DuoStyle.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private CategoryResponse sampleCategoryResponse;

    @BeforeEach
    void setUp() {
        sampleCategoryResponse = CategoryResponse.builder().id(1L).name("Áo Nam").build();
    }

    @Test
    @DisplayName("getAllCategories - Public endpoint fetches all categories")
    void testGetAllCategories_Success() {
        when(categoryService.getAllCategories()).thenReturn(List.of(sampleCategoryResponse));

        ResponseEntity<ApiResponse<List<CategoryResponse>>> response = categoryController.getAllCategories();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("getCategoryTree - Public endpoint fetches category tree")
    void testGetCategoryTree_Success() {
        when(categoryService.getCategoryTree()).thenReturn(List.of(sampleCategoryResponse));

        ResponseEntity<ApiResponse<List<CategoryResponse>>> response = categoryController.getCategoryTree();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("getCategoryById - Public endpoint fetches category by id")
    void testGetCategoryById_Success() {
        when(categoryService.getCategoryById(1L)).thenReturn(sampleCategoryResponse);

        ResponseEntity<ApiResponse<CategoryResponse>> response = categoryController.getCategoryById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Áo Nam", response.getBody().getData().getName());
    }
}
