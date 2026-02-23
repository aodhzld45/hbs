package com.hbs.hsbbo.admin.ai.usage.dto.response;

import com.hbs.hsbbo.admin.ai.usage.dto.TopQuestionProjection;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopQuestionItem {
    private String question;
    private long count;

    public static TopQuestionItem from(TopQuestionProjection p) {
        if (p == null) return null;
        return TopQuestionItem.builder()
                .question(p.getQuestion())
                .count(p.getCnt() != null ? p.getCnt() : 0L)
                .build();
    }
}
