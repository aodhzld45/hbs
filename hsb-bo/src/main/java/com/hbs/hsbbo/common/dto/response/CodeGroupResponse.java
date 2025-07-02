package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.CodeGroup;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class CodeGroupResponse {
    private String codeGroupId;
    private String groupName;
    private String description;
    private Integer orderSeq;

    // native query 용 Object Array response
    public static CodeGroupResponse nativeFrom(Object[] row) {
        CodeGroupResponse response = new CodeGroupResponse();
        response.setCodeGroupId((String) row[0]);
        response.setGroupName((String) row[1]);
        response.setDescription((String) row[2]);
        response.setOrderSeq(row[3] != null ? ((Number) row[3]).intValue() : null);
        return response;
    }

    public static CodeGroupResponse from(CodeGroup entity) {
        CodeGroupResponse response = new CodeGroupResponse();
        response.setCodeGroupId(entity.getCodeGroupId());
        response.setGroupName(entity.getGroupName());
        response.setDescription(entity.getDescription());
        response.setOrderSeq(entity.getOrderSeq());
        return response;
    }
}


