package com.DuoStyle.DuoStyle.dto.response;

public record AiStreamEvent(String type, String content) {
    public static AiStreamEvent delta(String content) { return new AiStreamEvent("delta", content); }
    public static AiStreamEvent error(String message) { return new AiStreamEvent("error", message); }
}
