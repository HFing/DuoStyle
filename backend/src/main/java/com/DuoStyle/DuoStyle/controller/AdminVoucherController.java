package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.CreateVoucherRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.VoucherResponse;
import com.DuoStyle.DuoStyle.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAllVouchers() {
        List<VoucherResponse> vouchers = voucherService.getAllVouchersForAdmin();
        return ResponseEntity.ok(ApiResponse.success(vouchers, "Admin vouchers retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@RequestBody CreateVoucherRequest request) {
        VoucherResponse voucher = voucherService.createVoucher(request);
        return ResponseEntity.ok(ApiResponse.success(voucher, "Tạo mã giảm giá thành công!"));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<VoucherResponse>> toggleStatus(@PathVariable Long id) {
        VoucherResponse voucher = voucherService.toggleVoucherStatus(id);
        return ResponseEntity.ok(ApiResponse.success(voucher, "Cập nhật trạng thái mã giảm giá thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa mã giảm giá!"));
    }
}
