package com.hbs.hsbbo.common.dto.request;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class CodeGroupRequest {
    private String codeGroupId;
    private String groupName;
    private String description;
    private Integer orderSeq;
    private String useTf;
}
