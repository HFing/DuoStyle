package com.DuoStyle.DuoStyle.ai;

import com.DuoStyle.DuoStyle.dto.response.*;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component @RequiredArgsConstructor
public class ProductTools {
    private final ProductService productService;

    @Tool(description = "Tìm tối đa 6 sản phẩm DuoStyle trong database theo từ khóa, giới tính và khoảng giá. Dùng tool này trước khi tư vấn sản phẩm.")
    public List<AiProductSummary> searchProducts(
            @ToolParam(description = "Từ khóa tên sản phẩm, có thể để trống", required = false) String keyword,
            @ToolParam(description = "MEN, WOMEN hoặc UNISEX; có thể để trống", required = false) String gender,
            @ToolParam(description = "Giá tối thiểu VND, có thể để trống", required = false) BigDecimal minPrice,
            @ToolParam(description = "Giá tối đa VND, có thể để trống", required = false) BigDecimal maxPrice) {
        GenderTarget target = gender == null || gender.isBlank() ? null : GenderTarget.valueOf(gender.trim().toUpperCase());
        return productService.getProducts(0, 6, "createdAt", "desc", keyword, null, target,
                        minPrice, maxPrice, null, null).getContent().stream()
                .limit(6)
                .map(p -> new AiProductSummary(p.getId(), p.getName(), p.getBasePrice(), p.getCategoryName(),
                        p.getThumbnailUrl(), p.getGenderTarget() == null ? null : p.getGenderTarget().name()))
                .toList();
    }

    @Tool(description = "Lấy chi tiết một sản phẩm DuoStyle từ database theo ID, gồm mô tả, ảnh và biến thể/tồn kho. Dùng khi khách hỏi chi tiết một sản phẩm cụ thể.")
    public AiProductDetail getProductDetail(@ToolParam(description = "ID sản phẩm trong database") Long productId) {
        ProductResponse p = productService.getProductById(productId);
        return new AiProductDetail(p.getId(), p.getName(), p.getDescription(), p.getBasePrice(),
                p.getCategoryName(), p.getImages(), p.getVariants());
    }
}
