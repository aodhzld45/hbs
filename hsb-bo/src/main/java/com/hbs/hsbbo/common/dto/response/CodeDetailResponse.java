package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeDetailResponse {
    private String codeId;
    private String codeNameKo;
    private String codeNameEn;
    private String parentCodeId;
    private Integer orderSeq;

    // native query 용 Object Array response
    public static CodeDetailResponse nativeFrom(Object[] row) {
        CodeDetailResponse response = new CodeDetailResponse();
        response.setCodeId((String) row[0]);
        response.setCodeNameKo((String) row[1]);
        response.setCodeNameEn((String) row[2]);
        response.setParentCodeId((String) row[3]);
        response.setOrderSeq(row[4] != null ? ((Number) row[3]).intValue() : null);
        return response;
    }

    public static CodeDetailResponse from(CodeDetail entity) {
        CodeDetailResponse response = new CodeDetailResponse();
        response.setCodeId(entity.getCodeId());
        response.setCodeNameKo(entity.getCodeNameKo());
        response.setCodeNameEn(entity.getCodeNameEn());
        response.setParentCodeId(entity.getParentCodeId());
        response.setOrderSeq(entity.getOrderSeq());
        return response;
    }
}
