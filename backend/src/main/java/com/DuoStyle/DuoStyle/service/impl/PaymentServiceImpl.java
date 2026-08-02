package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.config.VnPayConfig;
import com.DuoStyle.DuoStyle.dto.response.PaymentReturnResult;
import com.DuoStyle.DuoStyle.entity.Cart;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.entity.Payment;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.enums.CheckoutSource;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentStatus;
import com.DuoStyle.DuoStyle.repository.CartRepository;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.PaymentRepository;
import com.DuoStyle.DuoStyle.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final Pattern TRANSACTION_REFERENCE = Pattern.compile("^([1-9][0-9]*)_[0-9]+$");
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VIETNAM_TIME_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final VnPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;

    @Override
    public String createVnPayPaymentUrl(Order order, HttpServletRequest request) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        String vnp_TxnRef = order.getId() + "_" + System.currentTimeMillis();
        String vnp_IpAddr = request.getRemoteAddr();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", order.getTotalAmount().movePointRight(2).toBigIntegerExact().toString());
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + order.getId());
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        ZonedDateTime createdAt = ZonedDateTime.now(VIETNAM_TIME_ZONE);
        vnp_Params.put("vnp_CreateDate", VNPAY_DATE_FORMAT.format(createdAt));
        vnp_Params.put("vnp_ExpireDate", VNPAY_DATE_FORMAT.format(createdAt.plusMinutes(15)));

        String queryUrl = canonicalize(vnp_Params);
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), queryUrl);
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

    @Override
    @Transactional
    public PaymentReturnResult processVnPayReturn(Map<String, String> params) {
        if (params == null || !hasValidSignature(params)) {
            return failed("");
        }

        Optional<Long> orderId = parseOrderId(params.get("vnp_TxnRef"));
        if (orderId.isEmpty()) {
            return failed("");
        }

        Optional<Order> storedOrder = orderRepository.findById(orderId.get());
        if (storedOrder.isEmpty()) {
            return failed("");
        }
        Order order = storedOrder.get();

        if (!amountMatches(order, params.get("vnp_Amount"))) {
            return failed(order.getOrderCode());
        }

        Optional<Payment> storedPayment = paymentRepository.findByOrderId(order.getId());
        if (storedPayment.isEmpty()) {
            return failed(order.getOrderCode());
        }
        Payment payment = storedPayment.get();

        if (!"00".equals(params.get("vnp_ResponseCode"))) {
            payment.setStatus(PaymentStatus.CANCELLED);
            order.setStatus(OrderStatus.CANCELLED);
            return new PaymentReturnResult(order.getOrderCode(), "cancelled");
        }

        Optional<Map<Long, AggregatedVariantQuantity>> requestedQuantities = aggregateVariantQuantities(order);
        if (requestedQuantities.isEmpty() || !hasAvailableStock(requestedQuantities.get())) {
            return failed(order.getOrderCode());
        }

        decrementStock(requestedQuantities.get());
        if (order.getCheckoutSource() == CheckoutSource.CART) {
            cartRepository.findByUser_Email(order.getUser().getEmail())
                    .map(Cart::getItems)
                    .ifPresent(List::clear);
        }
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionNo(params.get("vnp_TransactionNo"));
        payment.setPaymentDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PROCESSING);
        return new PaymentReturnResult(order.getOrderCode(), "success");
    }

    private boolean hasValidSignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }
        String expectedHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), canonicalizeReturn(params));
        return MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.US_ASCII),
                receivedHash.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.US_ASCII));
    }

    private String canonicalizeReturn(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()))
                .filter(entry -> !"vnp_SecureHashType".equals(entry.getKey()))
                .filter(entry -> entry.getKey() != null && entry.getKey().startsWith("vnp_"))
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue),
                        this::canonicalize));
    }

    private String canonicalize(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII)
                        + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));
    }

    private Optional<Long> parseOrderId(String transactionReference) {
        if (transactionReference == null) {
            return Optional.empty();
        }
        Matcher matcher = TRANSACTION_REFERENCE.matcher(transactionReference);
        if (!matcher.matches()) {
            return Optional.empty();
        }
        try {
            return Optional.of(Long.parseLong(matcher.group(1)));
        } catch (NumberFormatException exception) {
            return Optional.empty();
        }
    }

    private boolean amountMatches(Order order, String returnedAmount) {
        try {
            BigInteger expectedAmount = order.getTotalAmount().movePointRight(2).toBigIntegerExact();
            return expectedAmount.equals(new BigInteger(returnedAmount));
        } catch (ArithmeticException | NumberFormatException | NullPointerException exception) {
            return false;
        }
    }

    private Optional<Map<Long, AggregatedVariantQuantity>> aggregateVariantQuantities(Order order) {
        if (order.getItems() == null) {
            return Optional.empty();
        }

        Map<Long, AggregatedVariantQuantity> quantities = new LinkedHashMap<>();
        for (OrderItem item : order.getItems()) {
            if (item == null
                    || item.getProductVariant() == null
                    || item.getProductVariant().getId() == null
                    || item.getQuantity() == null
                    || item.getQuantity() <= 0) {
                return Optional.empty();
            }

            ProductVariant variant = item.getProductVariant();
            quantities.merge(
                    variant.getId(),
                    new AggregatedVariantQuantity(variant, item.getQuantity()),
                    (current, additional) -> new AggregatedVariantQuantity(
                            current.variant(),
                            current.quantity() + additional.quantity()));
        }
        return Optional.of(quantities);
    }

    private boolean hasAvailableStock(Map<Long, AggregatedVariantQuantity> requestedQuantities) {
        return requestedQuantities.values().stream().allMatch(request ->
                request.variant().getStockQuantity() != null
                        && request.variant().getStockQuantity() >= request.quantity());
    }

    private void decrementStock(Map<Long, AggregatedVariantQuantity> requestedQuantities) {
        requestedQuantities.values().forEach(request -> request.variant().setStockQuantity(
                Math.toIntExact(request.variant().getStockQuantity() - request.quantity())));
    }

    private record AggregatedVariantQuantity(ProductVariant variant, long quantity) {}

    private PaymentReturnResult failed(String orderCode) {
        return new PaymentReturnResult(orderCode == null ? "" : orderCode, "failed");
    }
}
