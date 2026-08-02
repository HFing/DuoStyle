package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.ApplyVoucherRequest;
import com.DuoStyle.DuoStyle.dto.request.CreateVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.VoucherCalculation;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;
import com.DuoStyle.DuoStyle.entity.Voucher;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.VoucherRepository;
import com.DuoStyle.DuoStyle.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    public List<VoucherResponse> getAllActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findUsableVouchers(now).stream()
                .filter(voucher -> isNotExpired(voucher, now))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<VoucherResponse> getAllVouchersForAdmin() {
        return voucherRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        String code = normalize(request.getCode());
        if (voucherRepository.findByCodeAndActiveTrue(code).isPresent()) {
            throw new CustomException(400, "Mã giảm giá '" + code + "' đã tồn tại trên hệ thống!");
        }

        LocalDateTime expiry = null;
        if (request.getExpiryDate() != null && !request.getExpiryDate().isBlank()) {
            try {
                expiry = LocalDateTime.parse(request.getExpiryDate());
            } catch (Exception e) {
                expiry = LocalDateTime.now().plusMonths(1);
            }
        }

        Voucher voucher = Voucher.builder()
                .code(code)
                .title(request.getTitle() != null ? request.getTitle() : code)
                .description(request.getDescription())
                .discountType(request.getDiscountType() != null ? request.getDiscountType().toUpperCase() : "FIXED")
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .active(request.getActive() != null ? request.getActive() : true)
                .expiryDate(expiry)
                .build();

        Voucher saved = voucherRepository.save(voucher);
        return mapToResponse(saved);
    }

    @Override
    public VoucherResponse toggleVoucherStatus(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy mã giảm giá!"));
        voucher.setActive(!Boolean.TRUE.equals(voucher.getActive()));
        Voucher saved = voucherRepository.save(voucher);
        return mapToResponse(saved);
    }

    @Override
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy mã giảm giá!"));
        voucherRepository.delete(voucher);
    }

    @Override
    public VoucherCalculation calculateVoucher(String rawCode, BigDecimal subtotal) {
        validateSubtotal(subtotal);
        String code = normalize(rawCode);
        LocalDateTime now = LocalDateTime.now();
        Voucher voucher = requireUsableVoucher(code, now);
        String discountType = validateConfiguration(voucher);

        if (voucher.getMinOrderAmount() != null
                && subtotal.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new CustomException(400,
                    "Đơn hàng phải từ " + voucher.getMinOrderAmount().longValue()
                            + " VNĐ để áp dụng mã giảm giá này!");
        }

        BigDecimal discount = calculateDiscount(voucher, subtotal, discountType).min(subtotal);
        return new VoucherCalculation(
                voucher.getCode(),
                discount.setScale(0, RoundingMode.HALF_UP));
    }

    @Override
    public VoucherResponse applyVoucher(ApplyVoucherRequest request) {
        VoucherCalculation calculation = calculateVoucher(request.getCode(), request.getOrderAmount());
        LocalDateTime now = LocalDateTime.now();
        Voucher voucher = requireUsableVoucher(calculation.code(), now);

        VoucherResponse response = mapToResponse(voucher);
        response.setCalculatedDiscount(calculation.discountAmount());
        return response;
    }

    private String normalize(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new CustomException(400, "Mã giảm giá không được để trống!");
        }
        return rawCode.trim().toUpperCase(Locale.ROOT);
    }

    private void validateSubtotal(BigDecimal subtotal) {
        if (subtotal == null || subtotal.signum() < 0) {
            throw new CustomException(400, "Tổng tiền đơn hàng phải là số không âm!");
        }
    }

    private Voucher requireUsableVoucher(String code, LocalDateTime now) {
        Voucher voucher = voucherRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new CustomException(404,
                        "Mã giảm giá '" + code + "' không tồn tại hoặc không hoạt động!"));
        if (!Boolean.TRUE.equals(voucher.getActive())) {
            throw new CustomException(404,
                    "Mã giảm giá '" + code + "' không tồn tại hoặc không hoạt động!");
        }
        if (!isNotExpired(voucher, now)) {
            throw new CustomException(400, "Mã giảm giá '" + code + "' đã hết hạn!");
        }
        return voucher;
    }

    private boolean isNotExpired(Voucher voucher, LocalDateTime now) {
        return voucher.getExpiryDate() == null || voucher.getExpiryDate().isAfter(now);
    }

    private String validateConfiguration(Voucher voucher) {
        if (voucher.getDiscountType() == null
                || voucher.getDiscountValue() == null
                || voucher.getDiscountValue().signum() < 0
                || isNegative(voucher.getMinOrderAmount())
                || isNegative(voucher.getMaxDiscountAmount())) {
            throw invalidConfiguration(voucher);
        }

        String type = voucher.getDiscountType().trim().toUpperCase(Locale.ROOT);
        if (!"PERCENT".equals(type) && !"FIXED".equals(type)) {
            throw invalidConfiguration(voucher);
        }
        return type;
    }

    private boolean isNegative(BigDecimal value) {
        return value != null && value.signum() < 0;
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal subtotal, String discountType) {
        if ("FIXED".equals(discountType)) {
            return voucher.getDiscountValue();
        }

        BigDecimal discount = subtotal.multiply(voucher.getDiscountValue());
        if (voucher.getMaxDiscountAmount() != null) {
            discount = discount.min(voucher.getMaxDiscountAmount());
        }
        return discount;
    }

    private CustomException invalidConfiguration(Voucher voucher) {
        return new CustomException(500,
                "Mã giảm giá '" + voucher.getCode() + "' có cấu hình không hợp lệ!");
    }

    private VoucherResponse mapToResponse(Voucher v) {
        return VoucherResponse.builder()
                .id(v.getId())
                .code(v.getCode())
                .title(v.getTitle())
                .description(v.getDescription())
                .discountType(v.getDiscountType())
                .discountValue(v.getDiscountValue())
                .minOrderAmount(v.getMinOrderAmount())
                .maxDiscountAmount(v.getMaxDiscountAmount())
                .active(v.getActive())
                .expiryDate(v.getExpiryDate())
                .build();
    }
}
