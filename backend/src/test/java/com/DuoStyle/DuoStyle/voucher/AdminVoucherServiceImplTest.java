package com.DuoStyle.DuoStyle.voucher;

import com.DuoStyle.DuoStyle.dto.request.CreateVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;
import com.DuoStyle.DuoStyle.entity.Voucher;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.VoucherRepository;
import com.DuoStyle.DuoStyle.service.impl.VoucherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminVoucherServiceImplTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    private Voucher activeVoucher;
    private Voucher inactiveVoucher;

    @BeforeEach
    void setUp() {
        activeVoucher = Voucher.builder()
                .id(1L)
                .code("DUOSTYLE100K")
                .title("Giảm 100K đơn 500K")
                .description("Ưu đãi mua sắm")
                .discountType("FIXED")
                .discountValue(new BigDecimal("100000"))
                .minOrderAmount(new BigDecimal("500000"))
                .active(true)
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build();

        inactiveVoucher = Voucher.builder()
                .id(2L)
                .code("SUMMER20")
                .title("Giảm 20%")
                .discountType("PERCENT")
                .discountValue(new BigDecimal("0.20"))
                .active(false)
                .build();
    }

    @Test
    @DisplayName("getAllVouchersForAdmin - Return list of all active and inactive vouchers")
    void testGetAllVouchersForAdmin_Success() {
        when(voucherRepository.findAll()).thenReturn(List.of(activeVoucher, inactiveVoucher));

        List<VoucherResponse> responses = voucherService.getAllVouchersForAdmin();

        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("DUOSTYLE100K", responses.get(0).getCode());
        assertEquals("SUMMER20", responses.get(1).getCode());
    }

    @Test
    @DisplayName("createVoucher - Successfully create new voucher")
    void testCreateVoucher_Success() {
        CreateVoucherRequest request = CreateVoucherRequest.builder()
                .code("FALL100K")
                .title("Giảm 100K Mùa Thu")
                .discountType("FIXED")
                .discountValue(new BigDecimal("100000"))
                .minOrderAmount(new BigDecimal("600000"))
                .active(true)
                .build();

        when(voucherRepository.findByCodeAndActiveTrue("FALL100K")).thenReturn(Optional.empty());
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(i -> {
            Voucher v = i.getArgument(0);
            v.setId(3L);
            return v;
        });

        VoucherResponse response = voucherService.createVoucher(request);

        assertNotNull(response);
        assertEquals("FALL100K", response.getCode());
        assertTrue(response.getActive());
        verify(voucherRepository, times(1)).save(any(Voucher.class));
    }

    @Test
    @DisplayName("toggleVoucherStatus - Toggle voucher from active to inactive")
    void testToggleVoucherStatus_Success() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(activeVoucher));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(i -> i.getArgument(0));

        VoucherResponse response = voucherService.toggleVoucherStatus(1L);

        assertNotNull(response);
        assertFalse(response.getActive());
    }

    @Test
    @DisplayName("deleteVoucher - Delete voucher by ID")
    void testDeleteVoucher_Success() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(activeVoucher));
        doNothing().when(voucherRepository).delete(activeVoucher);

        assertDoesNotThrow(() -> voucherService.deleteVoucher(1L));
        verify(voucherRepository, times(1)).delete(activeVoucher);
    }
}
