package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.response.AiSettingsResponse;
import com.DuoStyle.DuoStyle.entity.AiSettings;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.AiSettingsRepository;
import com.DuoStyle.DuoStyle.service.AiSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AiSettingsServiceImpl implements AiSettingsService {
    private static final Long SETTINGS_ID = 1L;
    private static final int MAX_PROMPT_LENGTH = 8000;
    private static final String DEFAULT_PROMPT = """
            Bạn là trợ lý thời trang của DuoStyle. Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.
            Khi khách hỏi sản phẩm, giá, biến thể hoặc tồn kho, bắt buộc dùng công cụ sản phẩm.
            Không được tự bịa sản phẩm, giá, tồn kho, giảm giá hoặc mã sản phẩm.
            Nếu không tìm thấy dữ liệu phù hợp, hãy nói rõ với khách.
            """;
    private final AiSettingsRepository repository;

    @Override @Transactional
    public String getSystemPrompt() { return getOrCreate().getSystemPrompt(); }

    @Override @Transactional
    public AiSettingsResponse getSettings() { return map(getOrCreate()); }

    @Override @Transactional
    public AiSettingsResponse updateSystemPrompt(String prompt) {
        String normalized = prompt == null ? "" : prompt.trim();
        if (normalized.isEmpty() || normalized.length() > MAX_PROMPT_LENGTH) {
            throw new CustomException(400, "System prompt phải có từ 1 đến 8000 ký tự.");
        }
        AiSettings settings = repository.findById(SETTINGS_ID)
                .orElseGet(() -> AiSettings.builder().id(SETTINGS_ID).build());
        settings.setSystemPrompt(normalized);
        return map(repository.save(settings));
    }

    private AiSettings getOrCreate() {
        return repository.findById(SETTINGS_ID).orElseGet(() -> repository.save(
                AiSettings.builder().id(SETTINGS_ID).systemPrompt(DEFAULT_PROMPT).build()));
    }

    private AiSettingsResponse map(AiSettings settings) {
        return AiSettingsResponse.builder().systemPrompt(settings.getSystemPrompt()).updatedAt(settings.getUpdatedAt()).build();
    }
}
