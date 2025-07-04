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
    private Long id;
    private String codeGroupId;
    private String groupName;
    private String description;
    private Integer orderSeq;
    private String useTf;

    // native query 용 Object Array response
    public static CodeGroupResponse nativeFrom(Object[] row) {
        CodeGroupResponse response = new CodeGroupResponse();
        response.setId(row[0] != null ? ((Number) row[0]).longValue() : null);
        response.setCodeGroupId((String) row[1]);
        response.setGroupName((String) row[2]);
        response.setDescription((String) row[3]);
        response.setOrderSeq(row[4] != null ? ((Number) row[4]).intValue() : null);
        response.setUseTf(row[5] != null ? row[5].toString() : null);
        return response;
    }

    public static CodeGroupResponse from(CodeGroup entity) {
        CodeGroupResponse response = new CodeGroupResponse();
        response.setId(entity.getId());
        response.setCodeGroupId(entity.getCodeGroupId());
        response.setGroupName(entity.getGroupName());
        response.setDescription(entity.getDescription());
        response.setOrderSeq(entity.getOrderSeq());
        response.setUseTf(entity.getUseTf());
        return response;
    }
}


