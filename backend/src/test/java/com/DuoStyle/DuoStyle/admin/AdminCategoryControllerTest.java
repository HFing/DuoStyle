package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.controller.AdminCategoryController;
import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminCategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private AdminCategoryController adminCategoryController;

    private CategoryResponse sampleCategoryResponse;

    @BeforeEach
    void setUp() {
        sampleCategoryResponse = CategoryResponse.builder().id(5L).name("Áo Nam").build();
    }

    @Test
    @DisplayName("createCategory - Admin creates category")
    void testCreateCategory_Success() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Áo Nam");
        when(categoryService.createCategory(any())).thenReturn(sampleCategoryResponse);

        ResponseEntity<ApiResponse<CategoryResponse>> response = adminCategoryController.createCategory(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Áo Nam", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("updateCategory - Admin updates category")
    void testUpdateCategory_Success() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Áo Nam Mới");
        sampleCategoryResponse.setName("Áo Nam Mới");
        when(categoryService.updateCategory(5L, request)).thenReturn(sampleCategoryResponse);

        ResponseEntity<ApiResponse<CategoryResponse>> response = adminCategoryController.updateCategory(5L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Áo Nam Mới", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("deleteCategory - Admin deletes category")
    void testDeleteCategory_Success() {
        doNothing().when(categoryService).deleteCategory(5L);

        ResponseEntity<ApiResponse<Void>> response = adminCategoryController.deleteCategory(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(categoryService, times(1)).deleteCategory(5L);
    }
}
