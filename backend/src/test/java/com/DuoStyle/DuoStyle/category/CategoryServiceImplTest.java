package com.DuoStyle.DuoStyle.category;

import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import com.DuoStyle.DuoStyle.entity.Category;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CategoryRepository;
import com.DuoStyle.DuoStyle.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category parentCat;
    private Category childCat;

    @BeforeEach
    void setUp() {
        parentCat = Category.builder()
                .id(1L)
                .name("Thời Trang Nam")
                .slug("thoi-trang-nam")
                .genderTarget(GenderTarget.MEN)
                .parentCategory(null)
                .build();

        childCat = Category.builder()
                .id(2L)
                .name("Áo Măng Tô")
                .slug("ao-mang-to")
                .genderTarget(GenderTarget.MEN)
                .parentCategory(parentCat)
                .build();
    }

    @Test
    @DisplayName("getCategoryTree - Build nested parent and child category tree")
    void testGetCategoryTree_Success() {
        when(categoryRepository.findAll()).thenReturn(List.of(parentCat, childCat));

        List<CategoryResponse> tree = categoryService.getCategoryTree();

        assertNotNull(tree);
        assertFalse(tree.isEmpty());
    }

    @Test
    @DisplayName("createCategory - Successfully create root category")
    void testCreateCategory_RootSuccess() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Nước Hoa & Phụ Kiện");
        request.setSlug("nuoc-hoa-phu-kien");
        request.setGenderTarget(GenderTarget.UNISEX);

        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> {
            Category c = i.getArgument(0);
            c.setId(10L);
            return c;
        });

        CategoryResponse response = categoryService.createCategory(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Nước Hoa & Phụ Kiện", response.getName());
    }



    @Test
    @DisplayName("updateCategory - Update category fields successfully")
    void testUpdateCategory_Success() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Thời Trang Nam Đẳng Cấp");
        request.setSlug("thoi-trang-nam-dang-cap");
        request.setGenderTarget(GenderTarget.MEN);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(parentCat));
        when(categoryRepository.save(any(Category.class))).thenReturn(parentCat);

        CategoryResponse response = categoryService.updateCategory(1L, request);

        assertNotNull(response);
        verify(categoryRepository, times(1)).save(parentCat);
    }

    @Test
    @DisplayName("deleteCategory - Delete category by ID")
    void testDeleteCategory_Success() {
        doNothing().when(categoryRepository).deleteById(2L);

        assertDoesNotThrow(() -> categoryService.deleteCategory(2L));
        verify(categoryRepository, times(1)).deleteById(2L);
    }
}
