package com.DuoStyle.DuoStyle.ai;

import com.DuoStyle.DuoStyle.controller.AiChatController;
import com.DuoStyle.DuoStyle.dto.request.AiChatRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.AiChatResponse;
import com.DuoStyle.DuoStyle.dto.response.AiStreamEvent;
import com.DuoStyle.DuoStyle.service.AiChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiChatControllerTest {

    @Mock
    private AiChatService aiChatService;

    @InjectMocks
    private AiChatController aiChatController;

    private AiChatResponse sampleAiResponse;

    @BeforeEach
    void setUp() {
        sampleAiResponse = new AiChatResponse("Xin chào! Tôi có thể giúp gì cho bạn?");
    }

    @Test
    @DisplayName("chat - User sends chat request to AI")
    void testChat_Success() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Xin chào");
        when(aiChatService.chat(any())).thenReturn(sampleAiResponse);

        ResponseEntity<ApiResponse<AiChatResponse>> response = aiChatController.chat(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Xin chào! Tôi có thể giúp gì cho bạn?", response.getBody().getData().message());
    }

    @Test
    @DisplayName("stream - Streams SSE events from AI service")
    void testStream_Success() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Xin chào");
        when(aiChatService.stream(any())).thenReturn(Flux.just("Xin ", "chào"));

        Flux<ServerSentEvent<AiStreamEvent>> streamFlux = aiChatController.stream(request);
        List<ServerSentEvent<AiStreamEvent>> events = streamFlux.collectList().block();

        assertNotNull(events);
        assertEquals(2, events.size());
        assertEquals("delta", events.get(0).event());
    }

    @Test
    @DisplayName("stream - Emits error event when AI service fails")
    void testStream_Error() {
        AiChatRequest request = new AiChatRequest();
        request.setMessage("Xin chào");
        when(aiChatService.stream(any())).thenReturn(Flux.error(new RuntimeException("AI error")));

        Flux<ServerSentEvent<AiStreamEvent>> streamFlux = aiChatController.stream(request);
        List<ServerSentEvent<AiStreamEvent>> events = streamFlux.collectList().block();

        assertNotNull(events);
        assertEquals(1, events.size());
        assertEquals("error", events.get(0).event());
    }
}
