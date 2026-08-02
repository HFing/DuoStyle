package com.DuoStyle.DuoStyle.entity;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    private ClothingSize size;

    private String color;
    private String sku;

    private BigDecimal price;
    private Integer stockQuantity;
}
