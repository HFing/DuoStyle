package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String slug;
    private GenderTarget genderTarget;
    private Long parentId;
}
