package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.response.AiSettingsResponse;

public interface AiSettingsService {
    String getSystemPrompt();
    AiSettingsResponse getSettings();
    AiSettingsResponse updateSystemPrompt(String prompt);
}
