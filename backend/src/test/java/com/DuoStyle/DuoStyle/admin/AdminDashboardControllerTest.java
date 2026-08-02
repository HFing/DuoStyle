package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.controller.AdminDashboardController;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.service.AdminDashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardControllerTest {

    @Mock
    private AdminDashboardService adminDashboardService;

    @InjectMocks
    private AdminDashboardController adminDashboardController;

    @Test
    @DisplayName("getStats - Admin fetches dashboard stats")
    void testGetStats_Success() {
        DashboardResponse stats = DashboardResponse.builder().totalOrders(100L).build();
        when(adminDashboardService.getFilteredStats(null, null, null, null)).thenReturn(stats);

        ResponseEntity<ApiResponse<DashboardResponse>> response = adminDashboardController.getStats(null, null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(100L, response.getBody().getData().getTotalOrders());
    }
}
