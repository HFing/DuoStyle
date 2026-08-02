package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.BannerRequest;
import com.DuoStyle.DuoStyle.dto.response.BannerResponse;
import com.DuoStyle.DuoStyle.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Public Endpoint for Homepage Hero Slider
    @GetMapping("/api/v1/banners")
    public ResponseEntity<List<BannerResponse>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }

    // Admin Endpoints
    @GetMapping("/api/v1/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BannerResponse>> getAllBannersForAdmin() {
        return ResponseEntity.ok(bannerService.getAllBannersForAdmin());
    }

    @PostMapping("/api/v1/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerResponse> createBanner(@RequestBody BannerRequest request) {
        return ResponseEntity.ok(bannerService.createBanner(request));
    }

    @PutMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerResponse> updateBanner(@PathVariable Long id, @RequestBody BannerRequest request) {
        return ResponseEntity.ok(bannerService.updateBanner(id, request));
    }

    @PatchMapping("/api/v1/admin/banners/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerResponse> toggleBannerActive(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.toggleBannerActive(id));
    }

    @DeleteMapping("/api/v1/admin/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }
}
