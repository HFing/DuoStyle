package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class AiChatRequest { private String message; private List<AiChatMessage> history; }
