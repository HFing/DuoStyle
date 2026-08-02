package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.BannerRequest;
import com.DuoStyle.DuoStyle.dto.response.BannerResponse;
import com.DuoStyle.DuoStyle.entity.Banner;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.BannerRepository;
import com.DuoStyle.DuoStyle.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;

    @Override
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(BannerResponse::fromEntity)
                .toList();
    }

    @Override
    public List<BannerResponse> getAllBannersForAdmin() {
        return bannerRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(BannerResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return BannerResponse.fromEntity(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Banner not found with ID: " + id));

        banner.setTitle(request.getTitle());
        banner.setSubtitle(request.getSubtitle());
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            banner.setImageUrl(request.getImageUrl());
        }
        banner.setLinkUrl(request.getLinkUrl());
        if (request.getDisplayOrder() != null) {
            banner.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            banner.setActive(request.getActive());
        }

        return BannerResponse.fromEntity(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public BannerResponse toggleBannerActive(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Banner not found with ID: " + id));

        banner.setActive(!Boolean.TRUE.equals(banner.getActive()));
        return BannerResponse.fromEntity(bannerRepository.save(banner));
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new CustomException(404, "Banner not found with ID: " + id);
        }
        bannerRepository.deleteById(id);
    }
}
