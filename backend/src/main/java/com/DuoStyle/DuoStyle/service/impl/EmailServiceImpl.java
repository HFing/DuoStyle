package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private String formatVnd(BigDecimal amount) {
        if (amount == null) return "0 VNĐ";
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " VNĐ";
    }

    @Override
    public void sendOrderConfirmationEmail(String toEmail, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@duostyle.com");
            helper.setTo(toEmail);
            helper.setSubject("DuoStyle Luxury - Xác Nhận Đơn Hàng Thành Công #" + order.getOrderCode());

            // Build Product Items Rows
            StringBuilder itemsHtml = new StringBuilder();
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    BigDecimal totalItemPrice = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    itemsHtml.append("""
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 16px 12px; vertical-align: middle;">
                                <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 4px;">%s</div>
                                <div style="font-size: 12px; color: #64748b;">Mã SP: #%s</div>
                            </td>
                            <td style="padding: 16px 12px; vertical-align: middle; text-align: center;">
                                <span style="display: inline-block; background-color: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">%s / %s</span>
                            </td>
                            <td style="padding: 16px 12px; vertical-align: middle; text-align: center; font-weight: 600; color: #334155; font-size: 13px;">
                                %d
                            </td>
                            <td style="padding: 16px 12px; vertical-align: middle; text-align: right; font-weight: 700; color: #0f172a; font-size: 14px;">
                                %s
                            </td>
                        </tr>
                        """.formatted(
                            escapeHtml(item.getProductName()),
                            item.getId() != null ? item.getId() : "N/A",
                            escapeHtml(item.getSize() != null ? item.getSize() : "F"),
                            escapeHtml(item.getColor() != null ? item.getColor() : "Mặc định"),
                            item.getQuantity(),
                            formatVnd(totalItemPrice)
                    ));
                }
            } else {
                itemsHtml.append("""
                    <tr>
                        <td colspan="4" style="padding: 16px; text-align: center; color: #94a3b8;">Không có sản phẩm nào trong đơn hàng.</td>
                    </tr>
                    """);
            }

            // Payment Method display format
            String paymentMethodText = "COD (Thanh toán khi nhận hàng)";
            if (order.getPaymentMethod() != null) {
                switch (order.getPaymentMethod()) {
                    case VNPAY -> paymentMethodText = "VNPay (Đã thanh toán trực tuyến)";
                    case COD -> paymentMethodText = "COD (Thanh toán khi nhận hàng)";
                }
            }

            // Order Date format
            String orderDateStr = order.getCreatedAt() != null
                    ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"))
                    : "Mới đây";

            // Luxury Responsive HTML Template
            String htmlBody = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Xác Nhận Đơn Hàng DuoStyle</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="background-color: #f8fafc; padding: 40px 0;">
                        <tr>
                            <td align="center">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                                    
                                    <!-- BRAND HEADER -->
                                    <tr>
                                        <td align="center" style="background-color: #0f172a; padding: 32px 20px; border-bottom: 3px solid #d97706;">
                                            <div style="font-size: 26px; font-weight: 900; letter-spacing: 6px; color: #ffffff; text-transform: uppercase; font-family: 'Georgia', serif;">
                                                D U O S T Y L E
                                            </div>
                                            <div style="font-size: 10px; letter-spacing: 3px; color: #fbbf24; text-transform: uppercase; margin-top: 6px; font-weight: 700;">
                                                Luxury Fashion &amp; Lifestyle
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- HERO STATUS BADGE -->
                                    <tr>
                                        <td style="padding: 32px 32px 16px 32px; text-align: center;">
                                            <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 50px; padding: 6px 18px; margin-bottom: 16px;">
                                                <span style="color: #059669; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">✓ ĐÃ XÁC NHẬN ĐƠN HÀNG</span>
                                            </div>
                                            <h1 style="margin: 0; color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3;">
                                                Cảm ơn bạn đã mua sắm tại DuoStyle!
                                            </h1>
                                            <p style="margin-top: 8px; color: #64748b; font-size: 14px; line-height: 1.6;">
                                                Đơn hàng <strong style="color: #0f172a;">#%s</strong> của bạn đã được hệ thống tiếp nhận và đang tiến hành đóng gói giao đến bạn.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- ORDER & SHIPPING INFO CARDS -->
                                    <tr>
                                        <td style="padding: 16px 32px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #f1f5f9;">
                                                <tr>
                                                    <td width="50%%" style="vertical-align: top; padding-right: 12px;">
                                                        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px;">Thông tin đơn hàng</div>
                                                        <div style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Mã đơn:</strong> #%s</div>
                                                        <div style="font-size: 13px; color: #334155; margin-bottom: 4px;"><strong>Thời gian:</strong> %s</div>
                                                        <div style="font-size: 13px; color: #334155;"><strong>Thanh toán:</strong> %s</div>
                                                    </td>
                                                    <td width="50%%" style="vertical-align: top; padding-left: 12px; border-left: 1px solid #e2e8f0;">
                                                        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px;">Địa chỉ giao hàng</div>
                                                        <div style="font-size: 13px; color: #0f172a; font-weight: 700; margin-bottom: 4px;">%s</div>
                                                        <div style="font-size: 13px; color: #334155; margin-bottom: 4px;">SĐT: %s</div>
                                                        <div style="font-size: 13px; color: #334155; line-height: 1.4;">%s</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- PRODUCT TABLE -->
                                    <tr>
                                        <td style="padding: 16px 32px;">
                                            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Chi tiết sản phẩm</div>
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="border-collapse: collapse;">
                                                <thead>
                                                    <tr style="background-color: #f1f5f9; border-radius: 6px;">
                                                        <th align="left" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Sản phẩm</th>
                                                        <th align="center" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Phân loại</th>
                                                        <th align="center" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">SL</th>
                                                        <th align="right" style="padding: 10px 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    %s
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- ORDER TOTAL SUMMARY -->
                                    <tr>
                                        <td style="padding: 16px 32px 24px 32px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="background-color: #fafafa; border-radius: 8px; padding: 16px; border: 1px solid #f1f5f9;">
                                                <tr>
                                                    <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Tạm tính:</td>
                                                    <td align="right" style="font-size: 13px; color: #0f172a; font-weight: 600; padding-bottom: 6px;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Phí vận chuyển:</td>
                                                    <td align="right" style="font-size: 13px; color: #059669; font-weight: 600; padding-bottom: 8px;">Miễn phí (Free)</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size: 15px; font-weight: 800; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 10px;">TỔNG CỘNG THANH TOÁN:</td>
                                                    <td align="right" style="font-size: 18px; font-weight: 900; color: #d97706; border-top: 1px solid #e2e8f0; padding-top: 10px;">%s</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- CTA BUTTON -->
                                    <tr>
                                        <td align="center" style="padding: 0 32px 32px 32px;">
                                            <a href="%s/profile?tab=orders" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); text-transform: uppercase; letter-spacing: 0.5px;">
                                                Theo Dõi Đơn Hàng Của Bạn ➔
                                            </a>
                                        </td>
                                    </tr>

                                    <!-- LUXURY FOOTER -->
                                    <tr>
                                        <td align="center" style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                            <div style="font-weight: 700; color: #475569; margin-bottom: 4px;">DuoStyle Luxury Fashion Store</div>
                                            <div>Hotline hỗ trợ: <strong style="color: #475569;">1900-DUOSTYLE</strong> | Email: <strong style="color: #475569;">support@duostyle.com</strong></div>
                                            <div style="margin-top: 8px; font-size: 11px;">Đây là email tự động gửi từ hệ thống DuoStyle. Quý khách vui lòng không phản hồi trực tiếp qua email này.</div>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                    escapeHtml(order.getOrderCode()),
                    escapeHtml(order.getOrderCode()),
                    orderDateStr,
                    paymentMethodText,
                    escapeHtml(toEmail),
                    escapeHtml(order.getPhone() != null ? order.getPhone() : "N/A"),
                    escapeHtml(order.getShippingAddress() != null ? order.getShippingAddress() : "N/A"),
                    itemsHtml.toString(),
                    formatVnd(order.getTotalAmount()),
                    formatVnd(order.getTotalAmount()),
                    frontendUrl
            );

            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Luxury order confirmation email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email to {}: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}

