package com.hbs.hsbbo.common.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CodeGroupRequest {
    private String codeGroupId;
    private String groupName;
    private String description;
    private Integer orderSeq;
    private String useTf;
}
