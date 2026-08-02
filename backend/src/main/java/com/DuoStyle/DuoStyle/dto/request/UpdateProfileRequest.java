package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String gender;
    private String address;
}
