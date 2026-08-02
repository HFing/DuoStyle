package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.controller.AdminUserController;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserController adminUserController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(1L).email("user@duostyle.com").fullName("Test User").enabled(true).build();
    }

    @Test
    @DisplayName("getAllUsers - Fetches all users successfully")
    void testGetAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser));

        ResponseEntity<ApiResponse<List<UserResponse>>> response = adminUserController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("toggleUserStatus - Success toggles enabled state")
    void testToggleUserStatus_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        ResponseEntity<ApiResponse<UserResponse>> response = adminUserController.toggleUserStatus(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().getData().isEnabled());
    }

    @Test
    @DisplayName("toggleUserStatus - Throws 404 when user not found")
    void testToggleUserStatus_NotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () ->
                adminUserController.toggleUserStatus(99L));

        assertEquals(404, exception.getStatus());
    }
}
