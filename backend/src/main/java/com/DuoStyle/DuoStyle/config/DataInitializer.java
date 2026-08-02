package com.DuoStyle.DuoStyle.config;

import com.DuoStyle.DuoStyle.entity.*;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.repository.*;
import com.DuoStyle.DuoStyle.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.net.URI;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistRepository wishlistRepository;
    private final BannerRepository bannerRepository;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.seed.reset:false}")
    private boolean resetEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!resetEnabled) {
            log.info("Data reset disabled. Set APP_SEED_RESET=true when you want to rebuild local data.");
            return;
        }

        SeedProduct[] seed = loadSeed();
        cleanDatabase();
        seedAccountsAndVoucher();
        List<Product> products = seedProducts(seed, seedCategories());
        seedBanners();
        log.warn("Seeded {} Coolmate products. Restart with APP_SEED_RESET=false.", products.size());
    }

    private SeedProduct[] loadSeed() {
        try (var input = new ClassPathResource("coolmate-products.json").getInputStream()) {
            SeedProduct[] products = objectMapper.readValue(input, SeedProduct[].class);
            if (products.length != 30 || Arrays.stream(products)
                    .anyMatch(product -> product.images() == null || product.images().size() < 2)) {
                throw new IllegalStateException("Seed must contain exactly 30 products and at least 2 images each");
            }
            return products;
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot read coolmate-products.json", exception);
        }
    }

    private void cleanDatabase() {
        paymentRepository.deleteAllInBatch();
        cartItemRepository.deleteAllInBatch();
        cartRepository.deleteAllInBatch();
        wishlistRepository.deleteAllInBatch();
        orderRepository.deleteAll();
        orderRepository.flush();
        productRepository.deleteAllInBatch();
        List<Category> categories = categoryRepository.findAll();
        categoryRepository.deleteAllInBatch(categories.stream().filter(c -> c.getParentCategory() != null).toList());
        categoryRepository.deleteAllInBatch(categories.stream().filter(c -> c.getParentCategory() == null).toList());
        userRepository.deleteAllInBatch();
        roleRepository.deleteAllInBatch();
        voucherRepository.deleteAllInBatch();
        bannerRepository.deleteAllInBatch();
    }

    private void seedAccountsAndVoucher() {
        Role userRole = roleRepository.save(Role.builder().name("ROLE_USER").build());
        Role adminRole = roleRepository.save(Role.builder().name("ROLE_ADMIN").build());
        userRepository.save(User.builder()
                .email("admin@duostyle.com").password(passwordEncoder.encode("admin123"))
                .fullName("DuoStyle Admin").phone("0988888888")
                .roles(Set.of(adminRole, userRole)).enabled(true).build());
        userRepository.save(User.builder()
                .email("user@duostyle.com").password(passwordEncoder.encode("user123"))
                .fullName("Khách hàng DuoStyle").phone("0912345678")
                .address("123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh")
                .roles(Set.of(userRole)).enabled(true).build());
        voucherRepository.save(Voucher.builder()
                .code("DUOSTYLE10").title("Giảm 10% toàn đơn")
                .description("Voucher dùng thử cho đơn hàng local")
                .discountType("PERCENT").discountValue(new BigDecimal("0.10"))
                .minOrderAmount(BigDecimal.ZERO).active(true).build());
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> result = new HashMap<>();
        saveCategory(result, "Nam", "nam", GenderTarget.MEN, null);
        saveCategory(result, "Nữ", "nu", GenderTarget.WOMEN, null);
        saveCategory(result, "Thể thao", "the-thao", GenderTarget.UNISEX, null);
        saveCategory(result, "Phụ kiện", "phu-kien", GenderTarget.UNISEX, null);
        saveCategory(result, "Áo nam", "ao-thun-nam", GenderTarget.MEN, "nam");
        saveCategory(result, "Quần nam", "quan-nam", GenderTarget.MEN, "nam");
        saveCategory(result, "Áo nữ", "ao-nu", GenderTarget.WOMEN, "nu");
        saveCategory(result, "Quần và váy nữ", "quan-nu", GenderTarget.WOMEN, "nu");
        saveCategory(result, "Chạy bộ", "chay-bo", GenderTarget.UNISEX, "the-thao");
        saveCategory(result, "Pickleball", "pickleball", GenderTarget.UNISEX, "the-thao");
        return result;
    }

    private void saveCategory(Map<String, Category> categories, String name, String slug,
                              GenderTarget gender, String parentSlug) {
        Category category = categoryRepository.save(Category.builder()
                .name(name).slug(slug).genderTarget(gender)
                .parentCategory(parentSlug == null ? null : categories.get(parentSlug)).build());
        categories.put(slug, category);
    }

    private List<Product> seedProducts(SeedProduct[] seed, Map<String, Category> categories) {
        List<Product> products = new ArrayList<>();
        for (int productIndex = 0; productIndex < seed.length; productIndex++) {
            SeedProduct item = seed[productIndex];
            String slug = URI.create(item.sourceUrl()).getPath().replaceFirst(".*/", "");
            List<String> uploadedImages = new ArrayList<>();
            for (int imageIndex = 0; imageIndex < item.images().size(); imageIndex++) {
                uploadedImages.add(cloudinaryService.uploadSeedImageFromUrl(
                        item.images().get(imageIndex), slug + "-" + (imageIndex + 1)));
            }

            Product product = Product.builder()
                    .name(item.name()).slug(slug)
                    .description(item.name() + ". Sản phẩm tham khảo từ Coolmate, dùng cho dữ liệu demo local.")
                    .basePrice(item.price()).thumbnailUrl(uploadedImages.getFirst())
                    .genderTarget(item.gender()).category(categories.get(item.category())).build();
            product.setImages(createImages(product, uploadedImages));
            product.setVariants(createVariants(product, item, productIndex + 1));
            products.add(productRepository.save(product));
        }
        return products;
    }

    private List<ProductImage> createImages(Product product, List<String> urls) {
        List<ProductImage> images = new ArrayList<>();
        for (int index = 0; index < urls.size(); index++) {
            images.add(ProductImage.builder().product(product).imageUrl(urls.get(index)).isPrimary(index == 0).build());
        }
        return images;
    }

    private List<ProductVariant> createVariants(Product product, SeedProduct item, int index) {
        ClothingSize[] sizes = "phu-kien".equals(item.category())
                ? new ClothingSize[]{ClothingSize.FREE_SIZE}
                : new ClothingSize[]{ClothingSize.S, ClothingSize.M, ClothingSize.L, ClothingSize.XL};
        return Arrays.stream(sizes).map(size -> ProductVariant.builder()
                .product(product).size(size).color("Màu tiêu chuẩn")
                .sku("CM-%02d-%s".formatted(index, size.name()))
                .price(item.price()).stockQuantity(20).build()).toList();
    }

    private void seedBanners() {
        String[] titles = {"FIFA 2026", "COOLMATE SPORT", "ZERO MARK", "RUNNING COLLECTION"};
        String[] sourceUrls = {
                "https://n7media.coolmate.me/uploads/2026/04/03/CM1561_2_1.jpg",
                "https://n7media.coolmate.me/uploads/2026/04/03/CM1946_2_1.jpg",
                "https://n7media.coolmate.me/uploads/2026/06/24/DSC_5699.jpg",
                "https://n7media.coolmate.me/uploads/2026/01/08/ao-thun-chay-bo-airflow-gradient-286-cam.jpg"
        };
        for (int index = 0; index < titles.length; index++) {
            String imageUrl = cloudinaryService.uploadSeedImageFromUrl(
                    sourceUrls[index], "banner-coolmate-" + titles[index].toLowerCase(Locale.ROOT).replace(' ', '-'));
            bannerRepository.save(Banner.builder().title(titles[index])
                    .subtitle("Bộ sưu tập mới tại DuoStyle")
                    .imageUrl(imageUrl)
                    .linkUrl("#collections").displayOrder(index + 1).active(true).build());
        }
    }

    private record SeedProduct(String sourceUrl, String name, String category, GenderTarget gender,
                               BigDecimal price, List<String> images) {
    }
}
