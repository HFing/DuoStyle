package com.DuoStyle.DuoStyle.ai;

import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

import static org.assertj.core.api.Assertions.assertThat;

class AiStreamSanitizerTest {
    @Test
    void removesInternalFunctionCallEvenWhenMarkerIsSplitAcrossChunks() {
        String visible = AiStreamSanitizer.sanitize(Flux.just(
                        "Bạn có thể xem sản phẩm sau. <fun",
                        "ction=searchProducts>{\"keyword\":\"áo\"}</function>"))
                .collectList().map(parts -> String.join("", parts)).block();

        assertThat(visible).isEqualTo("Bạn có thể xem sản phẩm sau. ");
    }

    @Test
    void preservesNormalTextAndChunkOrder() {
        String visible = AiStreamSanitizer.sanitize(Flux.just("Xin ", "chào", " bạn"))
                .collectList().map(parts -> String.join("", parts)).block();

        assertThat(visible).isEqualTo("Xin chào bạn");
    }
}
