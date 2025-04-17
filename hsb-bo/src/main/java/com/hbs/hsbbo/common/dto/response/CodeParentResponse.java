// src/main/java/com/hbs/hsbbo/common/dto/response/CodeParentResponse.java
package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.CodeParent;
import java.time.LocalDateTime;

public record CodeParentResponse(
        Integer pcodeNo,
        String  pcode,
        String  pcodeNm,
        String  pcodeMemo,
        Integer pcodeSeqNo,
        String  useTf,
        String  delTf,
        LocalDateTime regDate,
        LocalDateTime upDate
) {
    public static CodeParentResponse of(CodeParent e) {
        return new CodeParentResponse(
                e.getPcodeNo(), e.getPcode(), e.getPcodeNm(), e.getPcodeMemo(),
                e.getPcodeSeqNo(), e.getUseTf(), e.getDelTf(),
                e.getRegDate(), e.getUpDate()
        );
    }
}
