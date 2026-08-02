package com.DuoStyle.DuoStyle.ai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThatCode;

@SpringBootTest
class ProductToolsDatabaseTest {
    @Autowired
    private ProductTools productTools;

    @Test
    void searchProductsCanMapLazyProductRelationsOutsideTheWebRequestThread() {
        assertThatCode(() -> productTools.searchProducts(null, "MEN", null, null))
                .doesNotThrowAnyException();
    }
}
