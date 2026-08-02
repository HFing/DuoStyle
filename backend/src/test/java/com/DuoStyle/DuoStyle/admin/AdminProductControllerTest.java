package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.controller.AdminProductController;
import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.service.ProductService;
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
class AdminProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private AdminProductController adminProductController;

    private ProductResponse sampleProductResponse;

    @BeforeEach
    void setUp() {
        sampleProductResponse = ProductResponse.builder().id(10L).name("Áo Polo").build();
    }

    @Test
    @DisplayName("createProduct - Admin creates product")
    void testCreateProduct_Success() {
        ProductRequest request = new ProductRequest();
        request.setName("Áo Polo");
        when(productService.createProduct(any())).thenReturn(sampleProductResponse);

        ResponseEntity<ApiResponse<ProductResponse>> response = adminProductController.createProduct(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Áo Polo", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("updateProduct - Admin updates product")
    void testUpdateProduct_Success() {
        ProductRequest request = new ProductRequest();
        request.setName("Áo Polo Mới");
        sampleProductResponse.setName("Áo Polo Mới");
        when(productService.updateProduct(10L, request)).thenReturn(sampleProductResponse);

        ResponseEntity<ApiResponse<ProductResponse>> response = adminProductController.updateProduct(10L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Áo Polo Mới", response.getBody().getData().getName());
    }

    @Test
    @DisplayName("deleteProduct - Admin deletes product")
    void testDeleteProduct_Success() {
        doNothing().when(productService).deleteProduct(10L);

        ResponseEntity<ApiResponse<Void>> response = adminProductController.deleteProduct(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(productService, times(1)).deleteProduct(10L);
    }
}
