package com.DuoStyle.DuoStyle.dto.response;

import java.math.BigDecimal;

public record AiProductSummary(Long id, String name, BigDecimal price, String category,
                               String thumbnailUrl, String gender) {}
