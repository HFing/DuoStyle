package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.entity.Banner;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerResponse {
    private Long id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime createdAt;

    public static BannerResponse fromEntity(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .subtitle(banner.getSubtitle())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .displayOrder(banner.getDisplayOrder())
                .active(banner.getActive())
                .createdAt(banner.getCreatedAt())
                .build();
    }
}
