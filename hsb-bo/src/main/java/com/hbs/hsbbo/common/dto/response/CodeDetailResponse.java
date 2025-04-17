// src/main/java/com/hbs/hsbbo/common/dto/response/CodeDetailResponse.java
package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import java.time.LocalDateTime;

public record CodeDetailResponse(
        String  pcode,
        long dcodeNo,
        String  dcode,
        String  dcodeNm,
        String  dcodeExt,
        Integer dcodeSeqNo,
        String  useTf,
        String  delTf,
        LocalDateTime regDate,
        LocalDateTime upDate
) {
    public static CodeDetailResponse of(CodeDetail e) {
        return new CodeDetailResponse(
                e.getPcode(), e.getDcodeNo(), e.getDcode(), e.getDcodeNm(),
                e.getDcodeExt(), e.getDcodeSeqNo(), e.getUseTf(), e.getDelTf(),
                e.getRegDate(), e.getUpDate()
        );
    }
}
