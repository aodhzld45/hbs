package com.hbs.hsbbo.admin.ai.kb.domain.type;

public enum KbJobStatus {
    READY,        // 생성됨(대기)
    RUNNING,      // 처리 중
    SUCCESS,      // 완료
    FAILED,       // 실패
    CANCELLED     // 취소(옵션)
}
