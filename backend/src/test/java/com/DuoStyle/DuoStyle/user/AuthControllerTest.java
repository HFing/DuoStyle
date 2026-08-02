package com.DuoStyle.DuoStyle.user;

import com.DuoStyle.DuoStyle.controller.AuthController;
import com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest;
import com.DuoStyle.DuoStyle.dto.request.LoginRequest;
import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateProfileRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    private UserResponse sampleUserResponse;
    private Authentication sampleAuth;

    @BeforeEach
    void setUp() {
        sampleUserResponse = UserResponse.builder().id(1L).email("user@duostyle.com").fullName("Test User").build();
        sampleAuth = new UsernamePasswordAuthenticationToken("user@duostyle.com", "password", java.util.Collections.emptyList());
    }

    @Test
    @DisplayName("register - Register user success")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user@duostyle.com");
        request.setPassword("123456");
        request.setFullName("Test User");

        when(userService.register(request)).thenReturn(sampleUserResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.register(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("user@duostyle.com", response.getBody().getData().getEmail());
    }

    @Test
    @DisplayName("login - Login user success")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@duostyle.com");
        request.setPassword("123456");

        HttpServletRequest servletRequest = mock(HttpServletRequest.class);
        HttpSession session = mock(HttpSession.class);

        when(authenticationManager.authenticate(any())).thenReturn(sampleAuth);
        when(servletRequest.getSession(true)).thenReturn(session);
        when(userService.getUserByEmail("user@duostyle.com")).thenReturn(sampleUserResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.login(request, servletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Đăng nhập thành công!", response.getBody().getMessage());
    }

    @Test
    @DisplayName("logout - Logout user success")
    void testLogout_Success() {
        HttpServletRequest servletRequest = mock(HttpServletRequest.class);
        HttpSession session = mock(HttpSession.class);
        when(servletRequest.getSession(false)).thenReturn(session);

        ResponseEntity<ApiResponse<Void>> response = authController.logout(servletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(session, times(1)).invalidate();
    }

    @Test
    @DisplayName("getCurrentUser - Returns current user profile")
    void testGetCurrentUser_Success() {
        when(userService.getUserByEmail("user@duostyle.com")).thenReturn(sampleUserResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.getCurrentUser(sampleAuth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("user@duostyle.com", response.getBody().getData().getEmail());
    }

    @Test
    @DisplayName("getCurrentUser - Returns 401 when unauthenticated")
    void testGetCurrentUser_Unauthenticated() {
        ResponseEntity<ApiResponse<UserResponse>> response = authController.getCurrentUser(null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("updateProfile - Updates user profile")
    void testUpdateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("New Name");
        when(userService.updateProfile("user@duostyle.com", request)).thenReturn(sampleUserResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.updateProfile(sampleAuth, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("updateProfile - Returns 401 when unauthenticated")
    void testUpdateProfile_Unauthenticated() {
        ResponseEntity<ApiResponse<UserResponse>> response = authController.updateProfile(null, new UpdateProfileRequest());

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    @DisplayName("changePassword - Changes user password")
    void testChangePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("123");
        request.setNewPassword("456");
        doNothing().when(userService).changePassword("user@duostyle.com", request);

        ResponseEntity<ApiResponse<Void>> response = authController.changePassword(sampleAuth, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("changePassword - Returns 401 when unauthenticated")
    void testChangePassword_Unauthenticated() {
        ResponseEntity<ApiResponse<Void>> response = authController.changePassword(null, new ChangePasswordRequest());

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
