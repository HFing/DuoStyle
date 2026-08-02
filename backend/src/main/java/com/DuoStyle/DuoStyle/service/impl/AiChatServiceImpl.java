package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.ai.AiStreamSanitizer;
import com.DuoStyle.DuoStyle.ai.ProductTools;
import com.DuoStyle.DuoStyle.dto.request.AiChatMessage;
import com.DuoStyle.DuoStyle.dto.request.AiChatRequest;
import com.DuoStyle.DuoStyle.dto.response.AiChatResponse;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.AiChatService;
import com.DuoStyle.DuoStyle.service.AiSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {
    private static final int MAX_MESSAGE_LENGTH = 2000;
    private static final String CAPABILITY_RULES = """

            QUY TẮC BẮT BUỘC CỦA ỨNG DỤNG:
            - Bạn chỉ được tư vấn và hướng dẫn sử dụng giao diện. Bạn không được tuyên bố đã thêm vào giỏ, đặt hàng, giữ hàng, thanh toán hoặc hoàn tất giao dịch.
            - Khi khách cung cấp màu, kích cỡ hoặc số lượng, hãy hướng dẫn họ mở trang chi tiết sản phẩm, chọn biến thể rồi bấm \"Thêm vào giỏ\" hoặc \"Mua ngay\".
            - Trình bày ngắn gọn bằng đoạn văn hoặc danh sách; không dùng bảng Markdown.
            - Nếu khách yêu cầu số lượng sản phẩm cụ thể thì chỉ giới thiệu đúng số lượng đó. Nếu không nói số lượng, giới thiệu tối đa 3 sản phẩm.
            - Chỉ nói dữ liệu mà công cụ trả về và không được mô phỏng hành động mà ứng dụng chưa thực hiện.
            """;
    private final ChatClient.Builder chatClientBuilder;
    private final AiSettingsService settingsService;
    private final ProductTools productTools;

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        String question = validateQuestion(request);
        List<Message> history = normalizeHistory(request.getHistory());
        try {
            String answer = chatClientBuilder.build().prompt()
                    .system(effectiveSystemPrompt())
                    .messages(history)
                    .user(question)
                    .tools(productTools)
                    .call().content();
            return new AiChatResponse(answer);
        } catch (CustomException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new CustomException(503, "Trợ lý AI đang tạm thời không khả dụng. Vui lòng thử lại sau.");
        }
    }

    @Override
    public Flux<String> stream(AiChatRequest request) {
        String question = validateQuestion(request);
        List<Message> history = normalizeHistory(request.getHistory());
        Flux<String> response = chatClientBuilder.build().prompt()
                .system(effectiveSystemPrompt())
                .messages(history)
                .user(question)
                .tools(productTools)
                .stream().content();
        return AiStreamSanitizer.sanitize(response);
    }

    private String validateQuestion(AiChatRequest request) {
        String question = request == null || request.getMessage() == null ? "" : request.getMessage().trim();
        if (question.isEmpty() || question.length() > MAX_MESSAGE_LENGTH) {
            throw new CustomException(400, "Tin nhắn phải có từ 1 đến 2000 ký tự.");
        }
        return question;
    }

    private String effectiveSystemPrompt() {
        return settingsService.getSystemPrompt().trim() + CAPABILITY_RULES;
    }

    private List<Message> normalizeHistory(List<AiChatMessage> supplied) {
        if (supplied == null) return List.of();
        return supplied.stream().filter(Objects::nonNull)
                .filter(message -> message.getContent() != null && !message.getContent().isBlank())
                .filter(message -> "USER".equalsIgnoreCase(message.getRole())
                        || "ASSISTANT".equalsIgnoreCase(message.getRole()))
                .skip(Math.max(0, supplied.size() - 10L))
                .map(message -> "ASSISTANT".equalsIgnoreCase(message.getRole())
                        ? new AssistantMessage(trim(message.getContent()))
                        : new UserMessage(trim(message.getContent())))
                .map(Message.class::cast).toList();
    }

    private String trim(String value) {
        String trimmed = value.trim();
        return trimmed.substring(0, Math.min(trimmed.length(), MAX_MESSAGE_LENGTH));
    }
}
