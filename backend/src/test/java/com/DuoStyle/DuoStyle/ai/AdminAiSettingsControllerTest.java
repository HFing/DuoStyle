package com.DuoStyle.DuoStyle.ai;

import com.DuoStyle.DuoStyle.controller.AdminAiSettingsController;
import com.DuoStyle.DuoStyle.dto.request.UpdateAiSettingsRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.AiSettingsResponse;
import com.DuoStyle.DuoStyle.service.AiSettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAiSettingsControllerTest {

    @Mock
    private AiSettingsService aiSettingsService;

    @InjectMocks
    private AdminAiSettingsController adminAiSettingsController;

    private AiSettingsResponse sampleSettingsResponse;

    @BeforeEach
    void setUp() {
        sampleSettingsResponse = AiSettingsResponse.builder().systemPrompt("You are helpful assistant").build();
    }

    @Test
    @DisplayName("get - Admin fetches AI settings")
    void testGet_Success() {
        when(aiSettingsService.getSettings()).thenReturn(sampleSettingsResponse);

        ResponseEntity<ApiResponse<AiSettingsResponse>> response = adminAiSettingsController.get();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("You are helpful assistant", response.getBody().getData().getSystemPrompt());
    }

    @Test
    @DisplayName("update - Admin updates AI settings")
    void testUpdate_Success() {
        UpdateAiSettingsRequest request = new UpdateAiSettingsRequest();
        request.setSystemPrompt("New Prompt");
        when(aiSettingsService.updateSystemPrompt("New Prompt")).thenReturn(sampleSettingsResponse);

        ResponseEntity<ApiResponse<AiSettingsResponse>> response = adminAiSettingsController.update(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
