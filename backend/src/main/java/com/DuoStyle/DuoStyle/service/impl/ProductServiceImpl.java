package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductVariantResponse;
import com.DuoStyle.DuoStyle.entity.Category;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.ProductImage;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CategoryRepository;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.repository.ReviewRepository;
import com.DuoStyle.DuoStyle.service.ProductService;
import com.DuoStyle.DuoStyle.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            int page, int size, String sortBy, String sortDir,
            String keyword, Long categoryId, GenderTarget gender,
            BigDecimal minPrice, BigDecimal maxPrice,
            ClothingSize sizeFilter, String colorFilter
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = Specification.where(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.hasGender(gender))
                .and(ProductSpecification.keywordLike(keyword))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice))
                .and(ProductSpecification.hasSize(sizeFilter))
                .and(ProductSpecification.hasColor(colorFilter));

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        Page<ProductResponse> responsePage = productPage.map(this::mapToResponse);

        return PageResponse.fromPage(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Product not found"));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .thumbnailUrl(request.getThumbnailUrl())
                .genderTarget(request.getGenderTarget())
                .category(category)
                .build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<ProductImage> imageEntities = new ArrayList<>();
            boolean isFirst = true;
            for (String url : request.getImages()) {
                imageEntities.add(ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .isPrimary(isFirst)
                        .build());
                isFirst = false;
            }
            product.setImages(imageEntities);
            if (product.getThumbnailUrl() == null || product.getThumbnailUrl().isBlank()) {
                product.setThumbnailUrl(request.getImages().get(0));
            }
        }

        if (request.getVariants() != null) {
            List<ProductVariant> variants = request.getVariants().stream().map(v -> ProductVariant.builder()
                    .product(product)
                    .size(v.getSize())
                    .color(v.getColor())
                    .sku(v.getSku())
                    .price(v.getPrice() != null ? v.getPrice() : request.getBasePrice())
                    .stockQuantity(v.getStockQuantity())
                    .build()).toList();
            product.setVariants(variants);
        }

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Product not found"));

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setGenderTarget(request.getGenderTarget());

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<ProductImage> imageEntities = new ArrayList<>();
            boolean isFirst = true;
            for (String url : request.getImages()) {
                imageEntities.add(ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .isPrimary(isFirst)
                        .build());
                isFirst = false;
            }
            product.setImages(imageEntities);
        }

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product product) {
        List<ProductVariantResponse> variantResponses = product.getVariants() != null ?
                product.getVariants().stream().map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .size(v.getSize())
                        .color(v.getColor())
                        .sku(v.getSku())
                        .price(v.getPrice())
                        .stockQuantity(v.getStockQuantity())
                        .build()).toList() : Collections.emptyList();

        List<String> imageList = new ArrayList<>();
        if (product.getThumbnailUrl() != null && !product.getThumbnailUrl().isBlank()) {
            imageList.add(product.getThumbnailUrl());
        }
        if (product.getImages() != null) {
            for (var img : product.getImages()) {
                if (img.getImageUrl() != null && !imageList.contains(img.getImageUrl())) {
                    imageList.add(img.getImageUrl());
                }
            }
        }

        Double avgRating = reviewRepository != null ? reviewRepository.findAverageRatingByProductId(product.getId()) : null;
        int reviewCount = reviewRepository != null ? reviewRepository.countByProductIdAndActiveTrue(product.getId()) : 0;

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .thumbnailUrl(product.getThumbnailUrl())
                .genderTarget(product.getGenderTarget())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .images(imageList)
                .variants(variantResponses)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0)
                .reviewCount(reviewCount)
                .build();
    }
}
