package com.hbs.hsbbo.admin.ai.brain.dto.request;

import com.hbs.hsbbo.admin.ai.brain.dto.model.request.*;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainChatRequest {
    private String tenantId;       // hsbs 등
    private String siteKey;        // ai_site_key.site_key

    private Long promptProfileId;  // ai_prompt_profile.id
    private Long widgetConfigId;   // ai_widget_config.id

    private String conversationId; // 없으면 null → Brain이 새로 발급

    private List<BrainMessage> messages;

    private BrainOptions options;              // 모델/샘플링 옵션
    private Map<String, Object> policies;      // policiesJson 파싱 or 그대로
    private List<BrainToolSpec> tools;         // toolsJson 파싱 결과
    private BrainRagOptions rag;               // RAG 관련 옵션
    private BrainMeta meta;                    // 로그용 메타
}
