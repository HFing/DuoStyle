package com.DuoStyle.DuoStyle.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.impl.CloudinaryServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceImplTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private CloudinaryServiceImpl cloudinaryService;

    @Test
    @DisplayName("uploadImage - Successfully upload image file to Cloudinary and return secure URL")
    void testUploadImage_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "image bytes".getBytes());

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of("secure_url", "https://cloudinary.com/test.jpg"));

        String url = cloudinaryService.uploadImage(file);

        assertNotNull(url);
        assertEquals("https://cloudinary.com/test.jpg", url);
    }

    @Test
    @DisplayName("uploadImage - Throw 500 CustomException on IOException")
    void testUploadImage_IOException() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "image bytes".getBytes());

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenThrow(new IOException("Disk read error"));

        CustomException exception = assertThrows(CustomException.class, () -> cloudinaryService.uploadImage(file));

        assertEquals(500, exception.getStatus());
        assertTrue(exception.getMessage().contains("Failed to upload image to Cloudinary"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void uploadSeedImageUsesDeterministicOverwriteOptions() throws IOException {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(eq("https://media.coolmate.me/product.jpg"), anyMap()))
                .thenReturn(Map.of("secure_url", "https://res.cloudinary.com/demo/product.jpg"));
        ArgumentCaptor<Map<String, Object>> options = ArgumentCaptor.forClass(Map.class);

        String result = cloudinaryService.uploadSeedImageFromUrl(
                "https://media.coolmate.me/product.jpg", "ao-thun-nam-1");

        assertEquals("https://res.cloudinary.com/demo/product.jpg", result);
        verify(uploader).upload(eq("https://media.coolmate.me/product.jpg"), options.capture());
        assertEquals("duostyle_products/coolmate_seed", options.getValue().get("folder"));
        assertEquals("ao-thun-nam-1", options.getValue().get("public_id"));
        assertEquals(Boolean.TRUE, options.getValue().get("overwrite"));
        assertEquals("image", options.getValue().get("resource_type"));
    }

    @Test
    void uploadSeedImagePropagatesFailureInsteadOfReturningSourceUrl() throws IOException {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(eq("https://media.coolmate.me/broken.jpg"), anyMap()))
                .thenThrow(new IOException("remote image unavailable"));

        CustomException error = assertThrows(CustomException.class, () -> cloudinaryService.uploadSeedImageFromUrl(
                "https://media.coolmate.me/broken.jpg", "broken-1"));

        assertEquals(500, error.getStatus());
        assertTrue(error.getMessage().contains("broken-1"));
        assertTrue(error.getMessage().contains("remote image unavailable"));
    }

    @Test
    void uploadSeedImageRejectsMissingSecureUrl() throws IOException {
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(eq("https://media.coolmate.me/no-url.jpg"), anyMap())).thenReturn(Map.of());

        assertThrows(CustomException.class, () -> cloudinaryService.uploadSeedImageFromUrl(
                "https://media.coolmate.me/no-url.jpg", "no-url-1"));
    }
}
