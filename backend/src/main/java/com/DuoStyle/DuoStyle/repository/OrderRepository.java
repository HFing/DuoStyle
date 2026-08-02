package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal sumTotalRevenue();

    List<Order> findTop5ByOrderByCreatedAtDesc();

    Page<Order> findByUserEmail(String userEmail, Pageable pageable);

    List<Order> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    java.util.Optional<Order> findByOrderCodeIgnoreCaseAndUserEmail(String orderCode, String userEmail);

    java.util.Optional<Order> findByOrderCodeIgnoreCase(String orderCode);
}
