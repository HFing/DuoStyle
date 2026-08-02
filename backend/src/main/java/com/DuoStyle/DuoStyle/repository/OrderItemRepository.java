package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    boolean existsByProductVariant_Id(Long productVariantId);
}
