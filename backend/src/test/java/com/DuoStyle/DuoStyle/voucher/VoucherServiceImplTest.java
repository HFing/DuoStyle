package com.DuoStyle.DuoStyle.voucher;

import com.DuoStyle.DuoStyle.dto.request.ApplyVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.VoucherCalculation;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;
import com.DuoStyle.DuoStyle.entity.Voucher;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.VoucherRepository;
import com.DuoStyle.DuoStyle.service.impl.VoucherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoucherServiceImplTest {

    @Mock
    private VoucherRepository voucherRepository;

    private VoucherServiceImpl service;
    private Voucher voucher;

    @BeforeEach
    void setUp() {
        service = new VoucherServiceImpl(voucherRepository);
        voucher = Voucher.builder()
                .id(20L)
                .code("VIP20")
                .title("Giảm 20% cho khách VIP")
                .description("Tối đa 500.000 VNĐ")
                .discountType("PERCENT")
                .discountValue(new BigDecimal("0.20"))
                .minOrderAmount(new BigDecimal("1000000"))
                .maxDiscountAmount(new BigDecimal("500000"))
                .active(true)
                .expiryDate(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void percentVoucherUsesNormalizedCodeSubtotalAndMaximumCap() {
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        VoucherCalculation result = service.calculateVoucher(" vip20 ", new BigDecimal("4000000"));

        assertEquals("VIP20", result.code());
        assertEquals(new BigDecimal("500000"), result.discountAmount());
    }

    @Test
    void fixedVoucherUsesConfiguredDiscount() {
        voucher.setCode("GIAM500K");
        voucher.setDiscountType("FIXED");
        voucher.setDiscountValue(new BigDecimal("500000"));
        voucher.setMaxDiscountAmount(null);
        when(voucherRepository.findByCodeAndActiveTrue("GIAM500K")).thenReturn(Optional.of(voucher));

        VoucherCalculation result = service.calculateVoucher("GIAM500K", new BigDecimal("4000000"));

        assertEquals(new BigDecimal("500000"), result.discountAmount());
    }

    @Test
    void fixedVoucherTypeWithSurroundingWhitespaceUsesFixedCalculation() {
        voucher.setCode("SPACEFIXED");
        voucher.setDiscountType(" FIXED ");
        voucher.setDiscountValue(new BigDecimal("500000"));
        voucher.setMinOrderAmount(BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(null);
        when(voucherRepository.findByCodeAndActiveTrue("SPACEFIXED")).thenReturn(Optional.of(voucher));

        VoucherCalculation result = service.calculateVoucher("SPACEFIXED", new BigDecimal("4000000"));

        assertEquals(new BigDecimal("500000"), result.discountAmount());
    }

    @Test
    void discountCannotExceedSubtotal() {
        voucher.setCode("BIGFIXED");
        voucher.setDiscountType("FIXED");
        voucher.setDiscountValue(new BigDecimal("500000"));
        voucher.setMinOrderAmount(BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(null);
        when(voucherRepository.findByCodeAndActiveTrue("BIGFIXED")).thenReturn(Optional.of(voucher));

        VoucherCalculation result = service.calculateVoucher("BIGFIXED", new BigDecimal("200000"));

        assertEquals(new BigDecimal("200000"), result.discountAmount());
    }

    @Test
    void subtotalBelowVoucherMinimumIsRejected() {
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("999999")));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("Đơn hàng phải từ"));
    }

    @Test
    void expiredVoucherIsRejected() {
        voucher.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("1000000")));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("đã hết hạn"));
    }

    @Test
    void inactiveOrMissingVoucherIsRejected() {
        when(voucherRepository.findByCodeAndActiveTrue("MISSING")).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher(" missing ", new BigDecimal("1000000")));

        assertEquals(404, exception.getStatus());
        assertTrue(exception.getMessage().contains("MISSING"));
    }

    @Test
    void unsupportedDiscountTypeIsRejectedAsInvalidConfiguration() {
        voucher.setDiscountType("POINTS");
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("1000000")));

        assertEquals(500, exception.getStatus());
        assertTrue(exception.getMessage().contains("cấu hình không hợp lệ"));
    }

    @Test
    void negativeSubtotalIsRejected() {
        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("-1")));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("Tổng tiền đơn hàng"));
    }

    @Test
    void missingSubtotalIsRejected() {
        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", null));

        assertEquals(400, exception.getStatus());
    }

    @Test
    void blankVoucherCodeIsRejected() {
        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("   ", new BigDecimal("1000000")));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("không được để trống"));
    }

    @Test
    void negativeDiscountValueIsRejectedAsInvalidConfiguration() {
        voucher.setDiscountValue(new BigDecimal("-0.20"));
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("1000000")));

        assertEquals(500, exception.getStatus());
    }

    @Test
    void negativeMinimumAmountIsRejectedAsInvalidConfiguration() {
        voucher.setMinOrderAmount(new BigDecimal("-1"));
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("1000000")));

        assertEquals(500, exception.getStatus());
    }

    @Test
    void negativeMaximumDiscountIsRejectedAsInvalidConfiguration() {
        voucher.setMaxDiscountAmount(new BigDecimal("-1"));
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.calculateVoucher("VIP20", new BigDecimal("1000000")));

        assertEquals(500, exception.getStatus());
    }

    @Test
    void activeListingExcludesExpiredVouchersEvenIfRepositoryReturnsOne() {
        Voucher expired = Voucher.builder()
                .id(21L)
                .code("OLD")
                .title("Mã cũ")
                .discountType("FIXED")
                .discountValue(new BigDecimal("100000"))
                .active(true)
                .expiryDate(LocalDateTime.now().minusMinutes(1))
                .build();
        when(voucherRepository.findUsableVouchers(any(LocalDateTime.class)))
                .thenReturn(List.of(voucher, expired));

        List<VoucherResponse> result = service.getAllActiveVouchers();

        assertEquals(List.of("VIP20"), result.stream().map(VoucherResponse::getCode).toList());
    }

    @Test
    void applyPreviewUsesTheSharedCalculationRules() {
        when(voucherRepository.findByCodeAndActiveTrue("VIP20")).thenReturn(Optional.of(voucher));
        ApplyVoucherRequest request = new ApplyVoucherRequest();
        request.setCode(" vip20 ");
        request.setOrderAmount(new BigDecimal("4000000"));

        VoucherResponse response = service.applyVoucher(request);

        assertEquals("VIP20", response.getCode());
        assertEquals(new BigDecimal("500000"), response.getCalculatedDiscount());
        assertEquals("Giảm 20% cho khách VIP", response.getTitle());
    }
}
