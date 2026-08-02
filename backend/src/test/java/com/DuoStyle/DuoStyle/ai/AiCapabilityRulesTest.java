package com.DuoStyle.DuoStyle.ai;

import com.DuoStyle.DuoStyle.dto.request.AiChatRequest;
import com.DuoStyle.DuoStyle.service.AiSettingsService;
import com.DuoStyle.DuoStyle.service.impl.AiChatServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiCapabilityRulesTest {
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient.Builder chatClientBuilder;
    @Mock private AiSettingsService settingsService;
    @Mock private ProductTools productTools;
    @InjectMocks private AiChatServiceImpl service;

    @Test
    void alwaysAppliesGuidanceOnlyRulesAfterTheAdminPrompt() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Navy Blue M 1");
        when(settingsService.getSystemPrompt()).thenReturn("Admin custom prompt");
        when(chatClientBuilder.build().prompt()
                .system(anyString()).messages(anyList()).user(anyString()).tools(any())
                .call().content()).thenReturn("OK");

        service.chat(request);

        verify(chatClientBuilder.build().prompt()).system(argThat((String prompt) ->
                prompt.contains("Admin custom prompt")
                        && prompt.contains("không được tuyên bố")
                        && prompt.contains("Thêm vào giỏ")
                        && prompt.contains("Mua ngay")
                        && prompt.contains("không dùng bảng Markdown")
                        && prompt.contains("tối đa 3 sản phẩm")));
    }
}
