package com.hbs.hsbbo.user.ai.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatWithPromptProfileRequest {
    // 어떤 프로필로 호출했는지 추적용(옵션)
    private Long promptProfileId;
    private String promptProfileName;
    private Integer promptProfileVersion;
    private String tenantId;
    private String purpose;

    // 유저 입력
    /** 실제 질문 (required) */
    private String userPrompt;
    /** RAG 나 나중에 추가할 컨텍스트 텍스트 (optional) */
    private String context;

    // 모델/파라미터 (PromptProfile에서 온 값)
    /** null이면 OpenAiService에서 defaultModel 사용 */
    private String model;
    private BigDecimal temperature;       // BigDecimal → Double 변환해서 넣기
    private BigDecimal topP;
    private Integer maxTokens;
    private Integer seed;
    private BigDecimal freqPenalty;
    private BigDecimal presencePenalty;

    // 프롬프트 리소스 (PromptProfile의 문자열 그대로)
    private String systemTpl;     // 시스템 템플릿
    private String guardrailTpl;  // 가드레일 텍스트
    private String styleJson;     // 스타일 JSON (문자열)
    private String policiesJson;  // 정책 JSON (문자열)

    // ===== stop / tools (JSON 파싱 결과) =====
    /** 예: ["\\nUser:", "\\nSystem:"] */
    private List<String> stop;

    // tools_json을 List<Map<String,Object>>로 파싱한 값 */
    private List<Map<String, Object>> tools;

}
