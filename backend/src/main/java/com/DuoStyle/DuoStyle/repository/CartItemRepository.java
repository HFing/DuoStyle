package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
