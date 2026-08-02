package com.DuoStyle.DuoStyle.user;

import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateProfileRequest;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.entity.Role;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.RoleRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        userRole = Role.builder().id(1L).name("ROLE_USER").build();

        sampleUser = User.builder()
                .id(1L)
                .email("testuser@duostyle.com")
                .password("encoded_pass")
                .fullName("Test User")
                .phone("0987654321")
                .enabled(true)
                .roles(Set.of(userRole))
                .build();
    }

    @Test
    @DisplayName("register - Throw CustomException 400 when email already exists")
    void testRegister_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("testuser@duostyle.com");
        request.setPassword("password123");
        request.setFullName("Test User");

        when(userRepository.existsByEmail("testuser@duostyle.com")).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class, () -> userService.register(request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("đã được sử dụng"));
    }

    @Test
    @DisplayName("register - Successfully register new user")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@duostyle.com");
        request.setPassword("password123");
        request.setFullName("New User");
        request.setPhone("0912345678");

        when(userRepository.existsByEmail("newuser@duostyle.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("newuser@duostyle.com", response.getEmail());
    }

    @Test
    @DisplayName("getUserByEmail - Return UserResponse when user exists")
    void testGetUserByEmail_Success() {
        when(userRepository.findByEmail("testuser@duostyle.com")).thenReturn(Optional.of(sampleUser));

        UserResponse response = userService.getUserByEmail("testuser@duostyle.com");

        assertNotNull(response);
        assertEquals("Test User", response.getFullName());
        assertTrue(response.getRoles().contains("ROLE_USER"));
    }

    @Test
    @DisplayName("updateProfile - Update user profile attributes")
    void testUpdateProfile_Success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Full Name");
        request.setPhone("0999888777");
        request.setAddress("123 Duostyle Street");
        request.setGender("MALE");

        when(userRepository.findByEmail("testuser@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserResponse response = userService.updateProfile("testuser@duostyle.com", request);

        assertNotNull(response);
        assertEquals("Updated Full Name", response.getFullName());
        assertEquals("0999888777", response.getPhone());
    }

    @Test
    @DisplayName("changePassword - Successfully change user password")
    void testChangePassword_Success() {
        com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest request = new com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest();
        request.setCurrentPassword("oldPassword123");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        when(userRepository.findByEmail("testuser@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPassword123", "encoded_pass")).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("new_encoded_pass");

        userService.changePassword("testuser@duostyle.com", request);

        verify(userRepository, times(1)).save(sampleUser);
        assertEquals("new_encoded_pass", sampleUser.getPassword());
    }

    @Test
    @DisplayName("changePassword - Throw 400 when current password is incorrect")
    void testChangePassword_IncorrectCurrentPassword() {
        com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest request = new com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest();
        request.setCurrentPassword("wrongOldPass");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        when(userRepository.findByEmail("testuser@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongOldPass", "encoded_pass")).thenReturn(false);

        CustomException exception = assertThrows(CustomException.class, () ->
                userService.changePassword("testuser@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("Mật khẩu hiện tại không chính xác"));
    }

    @Test
    @DisplayName("changePassword - Throw 400 when new password and confirm password do not match")
    void testChangePassword_PasswordMismatch() {
        com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest request = new com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest();
        request.setCurrentPassword("oldPassword123");
        request.setNewPassword("newPassword123");
        request.setConfirmPassword("differentPassword123");

        when(userRepository.findByEmail("testuser@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPassword123", "encoded_pass")).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class, () ->
                userService.changePassword("testuser@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("không khớp"));
    }
}
