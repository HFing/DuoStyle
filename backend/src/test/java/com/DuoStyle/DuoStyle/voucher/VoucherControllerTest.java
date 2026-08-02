package com.DuoStyle.DuoStyle.voucher;

import com.DuoStyle.DuoStyle.controller.VoucherController;
import com.DuoStyle.DuoStyle.dto.request.ApplyVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;
import com.DuoStyle.DuoStyle.service.VoucherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherControllerTest {

    @Mock
    private VoucherService voucherService;

    @InjectMocks
    private VoucherController voucherController;

    private VoucherResponse sampleVoucherResponse;

    @BeforeEach
    void setUp() {
        sampleVoucherResponse = VoucherResponse.builder().id(1L).code("DUO10").active(true).build();
    }

    @Test
    @DisplayName("getActiveVouchers - Public endpoint fetches active vouchers")
    void testGetActiveVouchers_Success() {
        when(voucherService.getAllActiveVouchers()).thenReturn(List.of(sampleVoucherResponse));

        ResponseEntity<ApiResponse<List<VoucherResponse>>> response = voucherController.getActiveVouchers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("applyVoucher - Customer applies voucher")
    void testApplyVoucher_Success() {
        ApplyVoucherRequest request = new ApplyVoucherRequest();
        request.setCode("DUO10");
        request.setOrderAmount(new BigDecimal("200000"));
        when(voucherService.applyVoucher(any())).thenReturn(sampleVoucherResponse);

        ResponseEntity<ApiResponse<VoucherResponse>> response = voucherController.applyVoucher(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DUO10", response.getBody().getData().getCode());
    }
}
