package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) GenderTarget gender,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) ClothingSize sizeFilter,
            @RequestParam(required = false) String colorFilter
    ) {
        PageResponse<ProductResponse> products = productService.getProducts(
                page, size, sortBy, sortDir,
                keyword, categoryId, gender,
                minPrice, maxPrice,
                sizeFilter, colorFilter
        );
        return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id), "Product retrieved successfully"));
    }
}
