package com.hbs.hsbbo.admin.ai.kb.domain.type;

public enum KbJobType {
    INGEST,       // 문서 인제스트(업로드/벡터화)
    REINDEX,      // 재인덱싱(옵션)
    DELETE_INDEX  // 벡터 인덱스 삭제(옵션)
}
