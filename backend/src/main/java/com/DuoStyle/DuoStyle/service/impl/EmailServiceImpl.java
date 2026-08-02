package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOrderConfirmationEmail(String toEmail, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@duostyle.com");
            helper.setTo(toEmail);
            helper.setSubject("DuoStyle - Xác Nhận Đơn Hàng Thành Công #" + order.getOrderCode());

            StringBuilder itemsHtml = new StringBuilder();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    itemsHtml.append("<tr>")
                            .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getProductName()).append("</td>")
                            .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getSize()).append(" / ").append(item.getColor()).append("</td>")
                            .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getQuantity()).append("</td>")
                            .append("<td style='padding: 8px; border-bottom: 1px solid #ddd;'>").append(item.getPrice()).append(" VNĐ</td>")
                            .append("</tr>");
                }
            }

            String htmlBody = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #2c3e50; text-align: center;">Cảm ơn bạn đã đặt hàng tại DuoStyle!</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Đơn hàng <strong>#%s</strong> của bạn đã được đặt thành công và đang được xử lý.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        
                        <h3 style="color: #34495e;">Thông tin giao hàng</h3>
                        <p><strong>Số điện thoại:</strong> %s</p>
                        <p><strong>Địa chỉ giao hàng:</strong> %s</p>
                        <p><strong>Phương thức thanh toán:</strong> %s</p>

                        <h3 style="color: #34495e;">Chi tiết sản phẩm</h3>
                        <table style="width: 100%%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 8px; border-bottom: 2px solid #ddd;">Sản phẩm</th>
                                    <th style="padding: 8px; border-bottom: 2px solid #ddd;">Size/Color</th>
                                    <th style="padding: 8px; border-bottom: 2px solid #ddd;">SL</th>
                                    <th style="padding: 8px; border-bottom: 2px solid #ddd;">Đơn giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                %s
                            </tbody>
                        </table>

                        <h3 style="text-align: right; color: #e74c3c;">Tổng cộng: %s VNĐ</h3>
                        
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #7f8c8d; text-align: center;">DuoStyle Fashion - Phong cách thời trang Nam & Nữ đẳng cấp</p>
                    </div>
                    """.formatted(
                    toEmail,
                    order.getOrderCode(),
                    order.getPhone() != null ? order.getPhone() : "N/A",
                    order.getShippingAddress() != null ? order.getShippingAddress() : "N/A",
                    order.getPaymentMethod(),
                    itemsHtml.toString(),
                    order.getTotalAmount()
            );

            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Order confirmation email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email to {}: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage());
        }
    }
}
