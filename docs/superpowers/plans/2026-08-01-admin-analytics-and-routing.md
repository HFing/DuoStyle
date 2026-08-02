# Admin Analytics & Routing Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Admin Login 404 routing error and build dynamic Sales Overview Monthly Growth Trend analytics end-to-end (Backend Java Spring Boot to Frontend React SVG Chart).

**Architecture:** 
- Update access control guard logic in `App.tsx` so non-resolved user states don't kick users to 404 (`not-found`).
- Create `MonthlySalesResponse.java` DTO and add `GET /api/v1/admin/orders/analytics/monthly` in `AdminOrderController.java` to aggregate non-cancelled order revenue by month.
- Connect `AdminDashboardPage.tsx` SVG chart to backend monthly analytics API with interactive tooltips and month/quarter toggles.

**Tech Stack:** Java 25, Spring Boot 4.1.0, JPA/Hibernate, MySQL, React, TypeScript, TailwindCSS.

---

### Task 1: Fix Admin Routing & Guard Resolution in App.tsx

**Files:**
- Modify: `c:\Study\CayThue\DuoStyle\frontend\src\App.tsx:150-165`

- [ ] **Step 1: Inspect and update access guard logic in App.tsx**

```tsx
// In App.tsx useEffect after api.get('/auth/me') resolves:
const isUserAdmin = checkIsAdmin(resolvedUser);

if (currentPage === 'profile') {
  if (!resolvedUser) {
    handleNavigate('login', '', null, 'Vui lòng đăng nhập để xem trang cá nhân.');
  } else if (isUserAdmin) {
    setCurrentPage('admin');
  }
} else if (currentPage === 'admin') {
  if (resolvedUser && !isUserAdmin) {
    handleNavigate('home', '', null, 'Bạn không có quyền truy cập trang Admin.');
  }
  // If resolvedUser is null, remain on admin or wait for login without forcing 'not-found'
}
```

- [ ] **Step 2: Verify Admin login redirect works cleanly without 404**

---

### Task 2: Implement Monthly Sales Analytics Backend DTO & API Endpoint

**Files:**
- Create: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\dto\response\MonthlySalesResponse.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\service\OrderService.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\service\impl\OrderServiceImpl.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\controller\AdminOrderController.java`

- [ ] **Step 1: Create `MonthlySalesResponse.java` DTO**

```java
package com.DuoStyle.DuoStyle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySalesResponse {
    private int month;
    private String monthName;
    private BigDecimal revenue;
    private long orderCount;
}
```

- [ ] **Step 2: Add method to `OrderService.java` and implement in `OrderServiceImpl.java`**

```java
@Override
public List<MonthlySalesResponse> getMonthlySalesAnalytics(Integer year) {
    int targetYear = (year != null && year > 2000) ? year : ZonedDateTime.now().getYear();
    String[] monthNames = {"JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"};
    List<Order> allOrders = orderRepository.findAll();

    List<MonthlySalesResponse> monthlyList = new ArrayList<>();
    for (int m = 1; m <= 12; m++) {
        final int currentMonth = m;
        List<Order> monthOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null 
                        && o.getCreatedAt().getYear() == targetYear 
                        && o.getCreatedAt().getMonthValue() == currentMonth
                        && o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal revenue = monthOrders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        monthlyList.add(MonthlySalesResponse.builder()
                .month(currentMonth)
                .monthName(monthNames[currentMonth - 1])
                .revenue(revenue)
                .orderCount(monthOrders.size())
                .build());
    }
    return monthlyList;
}
```

- [ ] **Step 3: Add `@GetMapping("/analytics/monthly")` to `AdminOrderController.java`**

```java
@GetMapping("/analytics/monthly")
public ResponseEntity<ApiResponse<List<MonthlySalesResponse>>> getMonthlyAnalytics(
        @RequestParam(required = false) Integer year
) {
    List<MonthlySalesResponse> analytics = orderService.getMonthlySalesAnalytics(year);
    return ResponseEntity.ok(ApiResponse.success(analytics, "Monthly sales analytics retrieved successfully"));
}
```

- [ ] **Step 4: Recompile and restart Spring Boot backend**

---

### Task 3: Render Dynamic Sales Overview Monthly Growth Trend Chart in AdminDashboardPage.tsx

**Files:**
- Modify: `c:\Study\CayThue\DuoStyle\frontend\src\pages\AdminDashboardPage.tsx:575-625`

- [ ] **Step 1: Add state and useEffect for fetching monthly analytics**

```tsx
const [monthlySales, setMonthlySales] = useState([]);
const [hoveredMonth, setHoveredMonth] = useState(null);

const fetchMonthlySales = () => {
  api.get('/admin/orders/analytics/monthly')
    .then(res => {
      if (res.data?.data) {
        setMonthlySales(res.data.data);
      }
    })
    .catch(err => console.log("Analytics fetch error"));
};

useEffect(() => {
  fetchMonthlySales();
}, []);
```

- [ ] **Step 2: Render dynamic SVG polyline and data dots with tooltip**

- [ ] **Step 3: Test and verify end-to-end functionality**
