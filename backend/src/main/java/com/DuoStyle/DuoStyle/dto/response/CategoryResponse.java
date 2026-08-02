package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private GenderTarget genderTarget;
    private Long parentId;
    private String parentName;
    private List<CategoryResponse> subCategories;
}
