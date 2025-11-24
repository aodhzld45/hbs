package com.hbs.hsbbo.user.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatWithPromptProfileResponse {

    // 요청에 사용된 프롬프트 프로필 메타
    private Long promptProfileId;
    private String promptProfileName;
    private Integer promptProfileVersion;

    // 실제 OpenAi Chat 응답
    private String model;
    private String text;
    private Integer inputTokens;
    private Integer outputTokens;
    private Integer totalTokens;
}
