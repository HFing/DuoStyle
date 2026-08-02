package com.DuoStyle.DuoStyle.ai;

import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Locale;

public final class AiStreamSanitizer {
    private static final String END = "\u0000DUOSTYLE_STREAM_END\u0000";
    private static final List<String> INTERNAL_MARKERS = List.of("<function", "<tool_call");

    private AiStreamSanitizer() {
    }

    public static Flux<String> sanitize(Flux<String> source) {
        return Flux.defer(() -> {
            State state = new State();
            return source.concatWithValues(END).handle((chunk, sink) -> {
                if (END.equals(chunk)) {
                    if (!state.blocked && !state.pending.isEmpty()) sink.next(state.pending);
                    return;
                }
                if (state.blocked || chunk == null || chunk.isEmpty()) return;
                state.pending += chunk;
                String lower = state.pending.toLowerCase(Locale.ROOT);
                int markerIndex = INTERNAL_MARKERS.stream().mapToInt(lower::indexOf)
                        .filter(index -> index >= 0).min().orElse(-1);
                if (markerIndex >= 0) {
                    String visible = state.pending.substring(0, markerIndex);
                    state.pending = "";
                    state.blocked = true;
                    if (!visible.isEmpty()) sink.next(visible);
                    return;
                }
                int retained = longestMarkerPrefixSuffix(lower);
                int safeLength = state.pending.length() - retained;
                if (safeLength > 0) {
                    sink.next(state.pending.substring(0, safeLength));
                    state.pending = state.pending.substring(safeLength);
                }
            });
        });
    }

    private static int longestMarkerPrefixSuffix(String value) {
        int longest = 0;
        for (String marker : INTERNAL_MARKERS) {
            int max = Math.min(value.length(), marker.length() - 1);
            for (int length = max; length > longest; length--) {
                if (value.endsWith(marker.substring(0, length))) {
                    longest = length;
                    break;
                }
            }
        }
        return longest;
    }

    private static final class State {
        private String pending = "";
        private boolean blocked;
    }
}
