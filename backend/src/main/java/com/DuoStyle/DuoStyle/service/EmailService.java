package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.entity.Order;

public interface EmailService {
    void sendOrderConfirmationEmail(String toEmail, Order order);
}
