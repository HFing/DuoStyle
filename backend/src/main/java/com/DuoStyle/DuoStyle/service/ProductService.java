package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.enums.GenderTarget;

import java.math.BigDecimal;

public interface ProductService {
    PageResponse<ProductResponse> getProducts(
            int page, int size, String sortBy, String sortDir,
            String keyword, Long categoryId, GenderTarget gender,
            BigDecimal minPrice, BigDecimal maxPrice,
            ClothingSize sizeFilter, String colorFilter
    );
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
