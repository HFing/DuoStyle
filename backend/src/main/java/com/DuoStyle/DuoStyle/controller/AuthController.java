package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.LoginRequest;
import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateProfileRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.register(request), "Đăng ký tài khoản thành công!"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@RequestBody LoginRequest request,
                                                            HttpServletRequest servletRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        HttpSession session = servletRequest.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        return ResponseEntity.ok(ApiResponse.success(
                userService.getUserByEmail(request.getEmail()), "Đăng nhập thành công!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success(null, "Đăng xuất thành công!"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Chưa xác thực đăng nhập"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                userService.getUserByEmail(authentication.getName()), "Thông tin người dùng hiện tại"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(Authentication authentication,
                                                                   @RequestBody UpdateProfileRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Chưa xác thực đăng nhập"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(authentication.getName(), request),
                "Cập nhật thông tin cá nhân thành công!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication authentication,
                                                            @RequestBody com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Chưa xác thực đăng nhập"));
        }
        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công!"));
    }
}
