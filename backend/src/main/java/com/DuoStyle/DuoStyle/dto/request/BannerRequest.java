package com.DuoStyle.DuoStyle.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerRequest {
    private String title;
    private String subtitle;
    private String imageUrl;

    private String linkUrl;
    private Integer displayOrder;
    private Boolean active;
}
