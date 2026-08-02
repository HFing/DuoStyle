package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.ApplyVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;
import com.DuoStyle.DuoStyle.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getActiveVouchers() {
        List<VoucherResponse> vouchers = voucherService.getAllActiveVouchers();
        return ResponseEntity.ok(ApiResponse.success(vouchers, "Retrieved active vouchers successfully"));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<VoucherResponse>> applyVoucher(@RequestBody ApplyVoucherRequest request) {
        VoucherResponse response = voucherService.applyVoucher(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Voucher applied successfully"));
    }
}
