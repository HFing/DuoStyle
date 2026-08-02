package com.DuoStyle.DuoStyle.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AiProductDetail(Long id, String name, String description, BigDecimal price,
                              String category, List<String> images,
                              List<ProductVariantResponse> variants) {}
