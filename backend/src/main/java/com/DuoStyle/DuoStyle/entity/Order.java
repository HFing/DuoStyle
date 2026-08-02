package com.DuoStyle.DuoStyle.entity;

import com.DuoStyle.DuoStyle.enums.CheckoutSource;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private BigDecimal subtotalAmount;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String phone;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private CheckoutSource checkoutSource;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    private LocalDateTime createdAt;
}
