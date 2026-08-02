package com.DuoStyle.DuoStyle.banner;

import com.DuoStyle.DuoStyle.dto.request.BannerRequest;
import com.DuoStyle.DuoStyle.dto.response.BannerResponse;
import com.DuoStyle.DuoStyle.entity.Banner;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.BannerRepository;
import com.DuoStyle.DuoStyle.service.impl.BannerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BannerServiceImplTest {

    @Mock
    private BannerRepository bannerRepository;

    @InjectMocks
    private BannerServiceImpl bannerService;

    private Banner banner;

    @BeforeEach
    void setUp() {
        banner = Banner.builder()
                .id(1L)
                .title("Coolmate Wavemotion")
                .subtitle("New Arrival Collection")
                .imageUrl("https://res.cloudinary.com/hfing/demo.jpg")
                .linkUrl("#products")
                .displayOrder(1)
                .active(true)
                .build();
    }

    @Test
    void testGetActiveBanners() {
        when(bannerRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc()).thenReturn(List.of(banner));

        List<BannerResponse> result = bannerService.getActiveBanners();

        assertEquals(1, result.size());
        assertEquals("Coolmate Wavemotion", result.get(0).getTitle());
    }

    @Test
    void testCreateBanner() {
        BannerRequest request = BannerRequest.builder()
                .title("New Banner")
                .imageUrl("https://res.cloudinary.com/hfing/new.jpg")
                .displayOrder(2)
                .active(true)
                .build();

        when(bannerRepository.save(any(Banner.class))).thenAnswer(i -> i.getArgument(0));

        BannerResponse response = bannerService.createBanner(request);

        assertNotNull(response);
        assertEquals("New Banner", response.getTitle());
        verify(bannerRepository, times(1)).save(any(Banner.class));
    }

    @Test
    void testUpdateBanner_Success() {
        BannerRequest request = BannerRequest.builder()
                .title("Updated Title")
                .imageUrl("https://res.cloudinary.com/hfing/updated.jpg")
                .build();

        when(bannerRepository.findById(1L)).thenReturn(Optional.of(banner));
        when(bannerRepository.save(any(Banner.class))).thenAnswer(i -> i.getArgument(0));

        BannerResponse response = bannerService.updateBanner(1L, request);

        assertEquals("Updated Title", response.getTitle());
    }

    @Test
    void testDeleteBanner_NotFound() {
        when(bannerRepository.existsById(99L)).thenReturn(false);

        assertThrows(CustomException.class, () -> bannerService.deleteBanner(99L));
    }
}
