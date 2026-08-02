package com.DuoStyle.DuoStyle.specification;

import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class OrderSpecification {

    public static Specification<Order> hasStatus(OrderStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Order> hasPaymentMethod(PaymentMethod method) {
        return (root, query, cb) -> method == null ? cb.conjunction() : cb.equal(root.get("paymentMethod"), method);
    }

    public static Specification<Order> createdBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
            }
            return cb.conjunction();
        };
    }
}
