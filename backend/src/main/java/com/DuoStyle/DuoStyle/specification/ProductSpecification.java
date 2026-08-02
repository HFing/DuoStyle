package com.DuoStyle.DuoStyle.specification;

import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    public static Specification<Product> hasCategory(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? cb.conjunction() : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> hasGender(GenderTarget gender) {
        return (root, query, cb) -> gender == null ? cb.conjunction() : cb.equal(root.get("genderTarget"), gender);
    }

    public static Specification<Product> priceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("basePrice"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("basePrice"), minPrice);
            } else if (maxPrice != null) {
                return cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice);
            }
            return cb.conjunction();
        };
    }

    public static Specification<Product> keywordLike(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }

    public static Specification<Product> hasSize(ClothingSize size) {
        return (root, query, cb) -> {
            if (size == null) return cb.conjunction();
            if (query != null) query.distinct(true);
            Join<Product, ProductVariant> variants = root.join("variants");
            return cb.equal(variants.get("size"), size);
        };
    }

    public static Specification<Product> hasColor(String color) {
        return (root, query, cb) -> {
            if (color == null || color.trim().isEmpty()) return cb.conjunction();
            if (query != null) query.distinct(true);
            Join<Product, ProductVariant> variants = root.join("variants");
            return cb.like(cb.lower(variants.get("color")), "%" + color.trim().toLowerCase() + "%");
        };
    }
}
