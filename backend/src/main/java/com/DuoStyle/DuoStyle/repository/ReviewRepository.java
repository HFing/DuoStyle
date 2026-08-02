package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdAndActiveTrueOrderByCreatedAtDesc(Long productId);

    Page<ProductReview> findByProductIdAndActiveTrue(Long productId, Pageable pageable);

    Page<ProductReview> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ProductReview> findByRating(Integer rating, Pageable pageable);

    @Query("SELECT r FROM ProductReview r WHERE " +
           "(:rating IS NULL OR r.rating = :rating) AND " +
           "(:search IS NULL OR LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.user.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.product.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ProductReview> findAllForAdminSearch(@Param("search") String search, @Param("rating") Integer rating, Pageable pageable);

    int countByProductIdAndActiveTrue(Long productId);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.active = true")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    boolean existsByUserIdAndProductIdAndOrderId(Long userId, Long productId, Long orderId);

    List<ProductReview> findByUserIdOrderByCreatedAtDesc(Long userId);
}
