package com.hbs.hsbbo.common.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CodeParentRequest(
        @NotBlank(message = "대분류코드(pcode)는 필수입니다.") String pcode,
        @NotBlank(message = "대분류명(pcodeNm)은 필수입니다.") String pcodeNm,
        String pcodeMemo,
        @NotNull(message = "전시순번(pcodeSeqNo)은 필수입니다.") Integer pcodeSeqNo
) {}
