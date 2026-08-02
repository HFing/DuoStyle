package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> responses = users.stream().map(this::mapToResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses, "Fetched all users successfully"));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        String statusStr = user.isEnabled() ? "Kích hoạt" : "Vô hiệu hóa";
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(user), "Đã " + statusStr + " tài khoản thành công"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .gender(user.getGender())
                .enabled(user.isEnabled())
                .roles(user.getRoles() != null ? user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()) : Collections.emptySet())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
