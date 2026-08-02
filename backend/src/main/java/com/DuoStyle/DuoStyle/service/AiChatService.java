package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.AiChatRequest;
import com.DuoStyle.DuoStyle.dto.response.AiChatResponse;
import reactor.core.publisher.Flux;

public interface AiChatService {
    AiChatResponse chat(AiChatRequest request);
    Flux<String> stream(AiChatRequest request);
}
