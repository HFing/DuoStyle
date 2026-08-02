package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.AiChatRequest;
import com.DuoStyle.DuoStyle.dto.response.*;
import com.DuoStyle.DuoStyle.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController @RequestMapping("/api/v1/ai") @RequiredArgsConstructor
public class AiChatController {
    private final AiChatService service;
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.chat(request), "AI response generated"));
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<AiStreamEvent>> stream(@RequestBody AiChatRequest request) {
        return service.stream(request)
                .map(content -> event("delta", AiStreamEvent.delta(content)))
                .onErrorResume(error -> Flux.just(event("error",
                        AiStreamEvent.error("Trợ lý AI đang tạm thời không khả dụng. Vui lòng thử lại sau."))));
    }

    private ServerSentEvent<AiStreamEvent> event(String name, AiStreamEvent data) {
        return ServerSentEvent.<AiStreamEvent>builder(data).event(name).build();
    }
}
