package com.DuoStyle.DuoStyle.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String gender;
    private String address;
    private boolean enabled;
    private Set<String> roles;
    private LocalDateTime createdAt;
}
