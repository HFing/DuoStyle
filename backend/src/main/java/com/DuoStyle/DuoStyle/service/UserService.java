package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.ChangePasswordRequest;
import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateProfileRequest;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;

public interface UserService {
    UserResponse register(RegisterRequest request);
    UserResponse getUserByEmail(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}
