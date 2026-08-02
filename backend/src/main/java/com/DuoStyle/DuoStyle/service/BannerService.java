package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.BannerRequest;
import com.DuoStyle.DuoStyle.dto.response.BannerResponse;
import java.util.List;

public interface BannerService {
    List<BannerResponse> getActiveBanners();
    List<BannerResponse> getAllBannersForAdmin();
    BannerResponse createBanner(BannerRequest request);
    BannerResponse updateBanner(Long id, BannerRequest request);
    BannerResponse toggleBannerActive(Long id);
    void deleteBanner(Long id);
}
