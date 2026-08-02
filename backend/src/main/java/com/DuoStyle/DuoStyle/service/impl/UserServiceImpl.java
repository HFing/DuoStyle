package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateProfileRequest;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.entity.Role;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.RoleRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(400, "Địa chỉ email này đã được sử dụng.");
        }
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .gender(request.getGender())
                .roles(Set.of(userRole))
                .enabled(true)
                .build();
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        return mapToResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng!")));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng!"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        return mapToResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(String email, com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng!"));

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new CustomException(400, "Tài khoản của bạn được tạo qua mạng xã hội (Google) nên chưa thiết lập mật khẩu trực tiếp.");
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new CustomException(400, "Vui lòng nhập mật khẩu hiện tại.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(400, "Mật khẩu hiện tại không chính xác.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new CustomException(400, "Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(400, "Mật khẩu mới và xác nhận mật khẩu không khớp.");
        }

        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new CustomException(400, "Mật khẩu mới không được trùng với mật khẩu hiện tại.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .gender(user.getGender())
                .address(user.getAddress())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
