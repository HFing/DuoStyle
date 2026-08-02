package com.DuoStyle.DuoStyle.ai;

import com.DuoStyle.DuoStyle.dto.request.AiChatMessage;
import com.DuoStyle.DuoStyle.dto.request.AiChatRequest;
import com.DuoStyle.DuoStyle.dto.response.AiChatResponse;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.AiSettingsService;
import com.DuoStyle.DuoStyle.service.impl.AiChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import reactor.core.publisher.Flux;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiChatServiceImplTest {

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient.Builder chatClientBuilder;

    @Mock
    private AiSettingsService settingsService;

    @Mock
    private ProductTools productTools;

    @InjectMocks
    private AiChatServiceImpl aiChatService;

    @BeforeEach
    void setUp() {
        lenient().when(settingsService.getSystemPrompt()).thenReturn("System prompt default");
    }

    private AiChatMessage createMsg(String role, String content) {
        AiChatMessage msg = new AiChatMessage();
        msg.setRole(role);
        msg.setContent(content);
        return msg;
    }

    @Test
    @DisplayName("chat - Throw 400 when question is empty or null")
    void testChat_ValidationEmptyQuestion() {
        AiChatRequest emptyRequest = new AiChatRequest();
        emptyRequest.setMessage("");
        CustomException exception = assertThrows(CustomException.class, () -> aiChatService.chat(emptyRequest));
        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("1 đến 2000 ký tự"));
    }

    @Test
    @DisplayName("chat - Throw 400 when question exceeds 2000 characters")
    void testChat_ValidationExceedsLength() {
        AiChatRequest longRequest = new AiChatRequest();
        longRequest.setMessage("a".repeat(2001));
        CustomException exception = assertThrows(CustomException.class, () -> aiChatService.chat(longRequest));
        assertEquals(400, exception.getStatus());
    }

    @Test
    @DisplayName("chat - Successfully return AI chat response")
    void testChat_Success() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Gợi ý áo sơ mi");
        request.setHistory(List.of(createMsg("USER", "Chào bạn"), createMsg("ASSISTANT", "Tôi có thể giúp gì?")));

        when(chatClientBuilder.build().prompt()
                .system(anyString())
                .messages(anyList())
                .user(anyString())
                .tools(any())
                .call().content()).thenReturn("Dưới đây là một số mẫu áo sơ mi đẹp...");

        AiChatResponse response = aiChatService.chat(request);

        assertNotNull(response);
        assertEquals("Dưới đây là một số mẫu áo sơ mi đẹp...", response.message());
    }

    @Test
    @DisplayName("chat - Wrap unknown exception into 503 CustomException")
    void testChat_ExceptionHandling() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Gợi ý áo sơ mi");

        when(chatClientBuilder.build().prompt()
                .system(anyString())
                .messages(anyList())
                .user(anyString())
                .tools(any())
                .call().content()).thenThrow(new RuntimeException("Connection timeout"));

        CustomException exception = assertThrows(CustomException.class, () -> aiChatService.chat(request));
        assertEquals(503, exception.getStatus());
        assertTrue(exception.getMessage().contains("không khả dụng"));
    }

    @Test
    @DisplayName("stream - Successfully stream sanitized AI response")
    void testStream_Success() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Áo khoác nữ");

        Flux<String> mockStream = Flux.just("Áo ", "khoác ", "dạ ", "nữ ");
        when(chatClientBuilder.build().prompt()
                .system(anyString())
                .messages(anyList())
                .user(anyString())
                .tools(any())
                .stream().content()).thenReturn(mockStream);

        Flux<String> result = aiChatService.stream(request);
        List<String> items = result.collectList().block();

        assertNotNull(items);
        assertEquals(List.of("Áo ", "khoác ", "dạ ", "nữ "), items);
    }
}
