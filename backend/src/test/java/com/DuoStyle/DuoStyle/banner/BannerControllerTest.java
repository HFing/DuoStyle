package com.DuoStyle.DuoStyle.banner;

import com.DuoStyle.DuoStyle.controller.BannerController;
import com.DuoStyle.DuoStyle.dto.request.BannerRequest;
import com.DuoStyle.DuoStyle.dto.response.BannerResponse;
import com.DuoStyle.DuoStyle.service.BannerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BannerControllerTest {

    @Mock
    private BannerService bannerService;

    @InjectMocks
    private BannerController bannerController;

    private BannerResponse sampleBannerResponse;

    @BeforeEach
    void setUp() {
        sampleBannerResponse = BannerResponse.builder().id(1L).title("Sale 50%").active(true).build();
    }

    @Test
    @DisplayName("getActiveBanners - Returns active homepage banners")
    void testGetActiveBanners_Success() {
        when(bannerService.getActiveBanners()).thenReturn(List.of(sampleBannerResponse));

        ResponseEntity<List<BannerResponse>> response = bannerController.getActiveBanners();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    @DisplayName("getAllBannersForAdmin - Admin fetches all banners")
    void testGetAllBannersForAdmin_Success() {
        when(bannerService.getAllBannersForAdmin()).thenReturn(List.of(sampleBannerResponse));

        ResponseEntity<List<BannerResponse>> response = bannerController.getAllBannersForAdmin();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    @DisplayName("createBanner - Creates new banner")
    void testCreateBanner_Success() {
        BannerRequest request = BannerRequest.builder().title("Sale 50%").build();
        when(bannerService.createBanner(any())).thenReturn(sampleBannerResponse);

        ResponseEntity<BannerResponse> response = bannerController.createBanner(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Sale 50%", response.getBody().getTitle());
    }

    @Test
    @DisplayName("updateBanner - Updates banner")
    void testUpdateBanner_Success() {
        BannerRequest request = BannerRequest.builder().title("Sale 70%").build();
        sampleBannerResponse.setTitle("Sale 70%");
        when(bannerService.updateBanner(1L, request)).thenReturn(sampleBannerResponse);

        ResponseEntity<BannerResponse> response = bannerController.updateBanner(1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Sale 70%", response.getBody().getTitle());
    }

    @Test
    @DisplayName("toggleBannerActive - Toggles banner status")
    void testToggleBannerActive_Success() {
        sampleBannerResponse.setActive(false);
        when(bannerService.toggleBannerActive(1L)).thenReturn(sampleBannerResponse);

        ResponseEntity<BannerResponse> response = bannerController.toggleBannerActive(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().getActive());
    }

    @Test
    @DisplayName("deleteBanner - Deletes banner")
    void testDeleteBanner_Success() {
        doNothing().when(bannerService).deleteBanner(1L);

        ResponseEntity<Void> response = bannerController.deleteBanner(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(bannerService, times(1)).deleteBanner(1L);
    }
}
