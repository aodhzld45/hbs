package com.hbs.hsbbo.common.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CodeDetailRequest(
        @NotBlank(message = "하위코드(dcode)는 필수입니다.") String dcode,
        @NotBlank(message = "하위명(dcodeNm)은 필수입니다.") String dcodeNm,
        String dcodeExt,
        @NotNull(message = "전시순번(dcodeSeqNo)은 필수입니다.") Integer dcodeSeqNo
) {}
