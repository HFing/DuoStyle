package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.ApplyVoucherRequest;
import com.DuoStyle.DuoStyle.dto.request.CreateVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.VoucherCalculation;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {
    List<VoucherResponse> getAllActiveVouchers();
    VoucherCalculation calculateVoucher(String code, BigDecimal subtotal);
    VoucherResponse applyVoucher(ApplyVoucherRequest request);
    List<VoucherResponse> getAllVouchersForAdmin();
    VoucherResponse createVoucher(CreateVoucherRequest request);
    VoucherResponse toggleVoucherStatus(Long id);
    void deleteVoucher(Long id);
}
