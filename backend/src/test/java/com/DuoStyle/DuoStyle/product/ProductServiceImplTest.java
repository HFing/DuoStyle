package com.DuoStyle.DuoStyle.product;

import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.request.ProductVariantRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.entity.Category;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CategoryRepository;
import com.DuoStyle.DuoStyle.repository.CartItemRepository;
import com.DuoStyle.DuoStyle.repository.OrderItemRepository;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private com.DuoStyle.DuoStyle.repository.ReviewRepository reviewRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = Category.builder()
                .id(1L)
                .name("Áo Sơ Mi")
                .slug("ao-so-mi")
                .genderTarget(GenderTarget.MEN)
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .name("Áo Sơ Mi Luxury DuoStyle")
                .slug("ao-so-mi-luxury-duostyle")
                .description("Sản phẩm thiết kế cao cấp")
                .basePrice(new BigDecimal("1500000"))
                .genderTarget(GenderTarget.MEN)
                .thumbnailUrl("https://example.com/thumb.jpg")
                .category(sampleCategory)
                .variants(new ArrayList<>())
                .images(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getProductById - Return ProductResponse when product exists")
    void testGetProductById_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Áo Sơ Mi Luxury DuoStyle", response.getName());
    }

    @Test
    @DisplayName("getProductById - Throw CustomException 404 when product not found")
    void testGetProductById_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () -> productService.getProductById(99L));

        assertEquals(404, exception.getStatus());
        assertTrue(exception.getMessage().contains("Product not found"));
    }

    @Test
    @DisplayName("createProduct - Successfully create product with category and variants")
    void testCreateProduct_Success() {
        ProductRequest request = new ProductRequest();
        request.setName("Áo Măng Tô Premium");
        request.setSlug("ao-mang-to-premium");
        request.setDescription("Chất liệu wool");
        request.setBasePrice(new BigDecimal("2500000"));
        request.setGenderTarget(GenderTarget.MEN);
        request.setThumbnailUrl("https://example.com/coat.jpg");
        request.setCategoryId(1L);

        ProductVariantRequest vReq = new ProductVariantRequest();
        vReq.setSize(ClothingSize.L);
        vReq.setColor("Đen");
        vReq.setSku("DS-COAT-L");
        vReq.setPrice(new BigDecimal("2500000"));
        vReq.setStockQuantity(15);
        request.setVariants(List.of(vReq));

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(20L);
            return p;
        });

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals(20L, response.getId());
        assertEquals("Áo Măng Tô Premium", response.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("updateProduct - Successfully update existing product")
    void testUpdateProduct_Success() {
        Category newCategory = Category.builder().id(2L).name("Jackets").slug("jackets").build();
        ProductVariant existingVariant = ProductVariant.builder()
                .id(31L)
                .product(sampleProduct)
                .size(ClothingSize.M)
                .color("Black")
                .sku("SHIRT-M")
                .price(new BigDecimal("1500000"))
                .stockQuantity(2)
                .build();
        sampleProduct.setVariants(new ArrayList<>(List.of(existingVariant)));

        ProductRequest request = new ProductRequest();
        request.setName("Áo Sơ Mi Cập Nhật");
        request.setSlug("ao-so-mi-cap-nhat");
        request.setDescription("Updated");
        request.setBasePrice(new BigDecimal("1800000"));
        request.setGenderTarget(GenderTarget.MEN);
        request.setCategoryId(2L);

        ProductVariantRequest existingRequest = new ProductVariantRequest();
        existingRequest.setId(31L);
        existingRequest.setSize(ClothingSize.M);
        existingRequest.setColor("Navy");
        existingRequest.setSku("SHIRT-M");
        existingRequest.setPrice(new BigDecimal("1800000"));
        existingRequest.setStockQuantity(8);

        ProductVariantRequest newRequest = new ProductVariantRequest();
        newRequest.setSize(ClothingSize.L);
        newRequest.setColor("Navy");
        newRequest.setSku("SHIRT-L");
        newRequest.setPrice(new BigDecimal("1800000"));
        newRequest.setStockQuantity(5);
        request.setVariants(List.of(existingRequest, newRequest));

        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(newCategory));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.updateProduct(10L, request);

        assertNotNull(response);
        assertSame(newCategory, sampleProduct.getCategory());
        assertEquals(2, sampleProduct.getVariants().size());
        assertSame(existingVariant, sampleProduct.getVariants().get(0));
        assertEquals(8, existingVariant.getStockQuantity());
        assertEquals("Navy", existingVariant.getColor());
        assertNull(sampleProduct.getVariants().get(1).getId());
        assertSame(sampleProduct, sampleProduct.getVariants().get(1).getProduct());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("updateProduct - Reject removing a variant referenced by an order")
    void testUpdateProduct_RejectsRemovingReferencedVariant() {
        ProductVariant existingVariant = ProductVariant.builder()
                .id(31L)
                .product(sampleProduct)
                .size(ClothingSize.M)
                .stockQuantity(2)
                .build();
        sampleProduct.setVariants(new ArrayList<>(List.of(existingVariant)));

        ProductRequest request = new ProductRequest();
        request.setName(sampleProduct.getName());
        request.setSlug(sampleProduct.getSlug());
        request.setBasePrice(sampleProduct.getBasePrice());
        request.setGenderTarget(sampleProduct.getGenderTarget());
        request.setCategoryId(sampleCategory.getId());
        request.setVariants(List.of());

        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(orderItemRepository.existsByProductVariant_Id(31L)).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class,
                () -> productService.updateProduct(10L, request));

        assertEquals(409, exception.getStatus());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteProduct - Successfully delete product by ID")
    void testDeleteProduct_Success() {
        doNothing().when(productRepository).deleteById(10L);

        assertDoesNotThrow(() -> productService.deleteProduct(10L));
        verify(productRepository, times(1)).deleteById(10L);
    }

    @Test
    @DisplayName("getProducts - Return paged response for MEN")
    void testGetProducts_Success() {
        Page<Product> page = new PageImpl<>(List.of(sampleProduct), PageRequest.of(0, 10), 1);
        when(productRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<ProductResponse> response = productService.getProducts(
                0, 10, "id", "asc", null, null, GenderTarget.MEN, null, null, null, null
        );

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Áo Sơ Mi Luxury DuoStyle", response.getContent().get(0).getName());
    }
}
