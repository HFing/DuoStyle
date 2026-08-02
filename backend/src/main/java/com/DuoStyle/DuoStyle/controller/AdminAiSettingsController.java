package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.UpdateAiSettingsRequest;
import com.DuoStyle.DuoStyle.dto.response.*;
import com.DuoStyle.DuoStyle.service.AiSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/admin/ai-settings") @RequiredArgsConstructor
public class AdminAiSettingsController {
    private final AiSettingsService service;
    @GetMapping public ResponseEntity<ApiResponse<AiSettingsResponse>> get() {
        return ResponseEntity.ok(ApiResponse.success(service.getSettings(), "AI settings retrieved"));
    }
    @PutMapping public ResponseEntity<ApiResponse<AiSettingsResponse>> update(@RequestBody UpdateAiSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.updateSystemPrompt(request == null ? null : request.getSystemPrompt()), "Đã lưu system prompt"));
    }
}
