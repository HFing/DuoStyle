package com.DuoStyle.DuoStyle.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_settings")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AiSettings {
    @Id private Long id;
    @Column(nullable = false, length = 8000) private String systemPrompt;
    private LocalDateTime updatedAt;
    @PrePersist @PreUpdate void touch() { updatedAt = LocalDateTime.now(); }
}
