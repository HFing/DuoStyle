package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.controller.AdminVoucherController;
import com.DuoStyle.DuoStyle.dto.request.CreateVoucherRequest;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminVoucherControllerTest {

    @Mock
    private VoucherService voucherService;

    @InjectMocks
    private AdminVoucherController adminVoucherController;

    private VoucherResponse sampleVoucherResponse;

    @BeforeEach
    void setUp() {
        sampleVoucherResponse = VoucherResponse.builder().id(1L).code("DUO20").active(true).build();
    }

    @Test
    @DisplayName("getAllVouchers - Admin fetches all vouchers")
    void testGetAllVouchers_Success() {
        when(voucherService.getAllVouchersForAdmin()).thenReturn(List.of(sampleVoucherResponse));

        ResponseEntity<ApiResponse<List<VoucherResponse>>> response = adminVoucherController.getAllVouchers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("createVoucher - Creates new voucher")
    void testCreateVoucher_Success() {
        CreateVoucherRequest request = CreateVoucherRequest.builder().code("DUO20").build();
        when(voucherService.createVoucher(any())).thenReturn(sampleVoucherResponse);

        ResponseEntity<ApiResponse<VoucherResponse>> response = adminVoucherController.createVoucher(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DUO20", response.getBody().getData().getCode());
    }

    @Test
    @DisplayName("toggleStatus - Toggles voucher status")
    void testToggleStatus_Success() {
        sampleVoucherResponse.setActive(false);
        when(voucherService.toggleVoucherStatus(1L)).thenReturn(sampleVoucherResponse);

        ResponseEntity<ApiResponse<VoucherResponse>> response = adminVoucherController.toggleStatus(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().getData().getActive());
    }

    @Test
    @DisplayName("deleteVoucher - Deletes voucher")
    void testDeleteVoucher_Success() {
        doNothing().when(voucherService).deleteVoucher(1L);

        ResponseEntity<ApiResponse<Void>> response = adminVoucherController.deleteVoucher(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(voucherService, times(1)).deleteVoucher(1L);
    }
}
