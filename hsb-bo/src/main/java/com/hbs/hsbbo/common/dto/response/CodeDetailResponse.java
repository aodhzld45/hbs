package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeDetailResponse {
    private Long id;
    private String codeId;
    private String codeNameKo;
    private String codeNameEn;
    private String parentCodeId;
    private Integer orderSeq;
    private String useTf;
    // native query 용 Object Array response
    public static CodeDetailResponse nativeFrom(Object[] row) {
        CodeDetailResponse response = new CodeDetailResponse();
        response.setId(row[0] != null ? ((Number) row[0]).longValue() : null);
        response.setCodeId((String) row[1]);
        response.setCodeNameKo((String) row[2]);
        response.setCodeNameEn((String) row[3]);
        response.setParentCodeId((String) row[4]);
        response.setOrderSeq(row[5] != null ? ((Number) row[5]).intValue() : null);
        response.setUseTf(row[6] != null ? row[6].toString() : null);

        return response;
    }

    public static CodeDetailResponse from(CodeDetail entity) {
        CodeDetailResponse response = new CodeDetailResponse();
        response.setId(entity.getId());
        response.setCodeId(entity.getCodeId());
        response.setCodeNameKo(entity.getCodeNameKo());
        response.setCodeNameEn(entity.getCodeNameEn());
        response.setParentCodeId(entity.getParentCodeId());
        response.setOrderSeq(entity.getOrderSeq());
        response.setUseTf(entity.getUseTf());
        return response;
    }
}
