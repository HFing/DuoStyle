package com.DuoStyle.DuoStyle.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class AiSettingsResponse {
    private String systemPrompt;
    private LocalDateTime updatedAt;
}
