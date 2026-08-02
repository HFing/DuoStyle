package com.DuoStyle.DuoStyle.ai;

import com.DuoStyle.DuoStyle.entity.AiSettings;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.AiSettingsRepository;
import com.DuoStyle.DuoStyle.service.impl.AiSettingsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiSettingsServiceImplTest {
    @Mock AiSettingsRepository repository;
    private AiSettingsServiceImpl service;

    @BeforeEach void setUp() { service = new AiSettingsServiceImpl(repository); }

    @Test void returnsExistingSystemPrompt() {
        when(repository.findById(1L)).thenReturn(Optional.of(AiSettings.builder().id(1L).systemPrompt("Custom").build()));
        assertEquals("Custom", service.getSystemPrompt());
    }

    @Test void createsDefaultPromptWhenSettingsAreMissing() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertTrue(service.getSystemPrompt().contains("DuoStyle"));
        verify(repository).save(argThat(settings -> settings.getId().equals(1L)));
    }

    @Test void rejectsBlankAndOversizedPrompts() {
        assertEquals(400, assertThrows(CustomException.class, () -> service.updateSystemPrompt("   ")).getStatus());
        assertEquals(400, assertThrows(CustomException.class, () -> service.updateSystemPrompt("x".repeat(8001))).getStatus());
    }

    @Test void updatesTheSingletonPrompt() {
        when(repository.findById(1L)).thenReturn(Optional.of(AiSettings.builder().id(1L).systemPrompt("Old").build()));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertEquals("New prompt", service.updateSystemPrompt("  New prompt  ").getSystemPrompt());
    }
}
