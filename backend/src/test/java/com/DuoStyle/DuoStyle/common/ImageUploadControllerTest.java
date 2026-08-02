package com.DuoStyle.DuoStyle.common;

import com.DuoStyle.DuoStyle.controller.ImageUploadController;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.service.CloudinaryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageUploadControllerTest {

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private ImageUploadController imageUploadController;

    @Test
    @DisplayName("uploadImage - Uploads file to Cloudinary")
    void testUploadImage_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "image content".getBytes());
        when(cloudinaryService.uploadImage(any(MultipartFile.class))).thenReturn("http://cloudinary.com/test.jpg");

        ResponseEntity<ApiResponse<String>> response = imageUploadController.uploadImage(file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("http://cloudinary.com/test.jpg", response.getBody().getData());
    }
}
