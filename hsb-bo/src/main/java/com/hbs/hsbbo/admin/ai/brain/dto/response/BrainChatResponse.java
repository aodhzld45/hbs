package com.hbs.hsbbo.admin.ai.brain.dto.response;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainChatResponse {
    private String conversationId;

    private String answer;          // 위젯에 바로 뿌릴 텍스트
    private Object answerRich;      // 나중에 markdown/블록 구조 등 확장용

    private BrainUsage usage;
    private BrainRagResult rag;
    private List<BrainToolCallResult> toolCalls;
    private BrainSafety safety;

}
