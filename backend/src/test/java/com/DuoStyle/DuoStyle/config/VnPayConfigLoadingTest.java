package com.DuoStyle.DuoStyle.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class VnPayConfigLoadingTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withInitializer(new ConfigDataApplicationContextInitializer())
            .withUserConfiguration(VnPayConfig.class);

    @Test
    void loadsLocalVnPayMerchantConfigurationAndCurrentReturnEndpoint() {
        contextRunner.run(context -> {
            VnPayConfig config = context.getBean(VnPayConfig.class);

            assertThat(config.getTmnCode()).isNotBlank();
            assertThat(config.getHashSecret()).isNotBlank();
            assertThat(config.getTmnCode())
                    .isEqualTo(context.getEnvironment().getProperty("VNP_TMN_CODE"));
            assertThat(config.getReturnUrl()).endsWith("/api/v1/payments/vnpay-return");
        });
    }
}
