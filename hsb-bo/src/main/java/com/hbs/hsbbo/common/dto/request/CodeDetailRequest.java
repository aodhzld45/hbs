package com.hbs.hsbbo.common.dto.request;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CodeDetailRequest {
    private String codeId;
    private Long codeGroupId;
    private String parentCodeId;
    private String codeNameKo;
    private String codeNameEn;
    private Integer orderSeq;
    private String useTf;
}

