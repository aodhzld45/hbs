package com.hbs.hsbbo.admin.sqlpractice.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProblemResponse {
    private Long id;
    private String title;
    private Integer level;
    private List<String> tags;
    private String descriptionMd;
    private ConstraintRule constraintRule;
    private boolean orderSensitive;

    // 공통 audit
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static ProblemResponse fromEntity(SqlProblem entity) {
        if (entity == null) return null;
        ProblemResponse response = new ProblemResponse();
        response.setId(entity.getId());
        response.setTitle(entity.getTitle());
        response.setLevel(entity.getLevel());
        response.setTags(extractTags(entity));
        response.setDescriptionMd(entity.getDescriptionMd());              // e → entity 로 수정
        response.setConstraintRule(entity.getConstraintRule());            // enum 직접 매핑
        response.setOrderSensitive(Boolean.TRUE.equals(entity.isOrderSensitive()));

        response.setUseTf(entity.getUseTf());
        response.setDelTf(entity.getDelTf());
        response.setRegAdm(entity.getRegAdm());
        response.setRegDate(entity.getRegDate());
        response.setUpAdm(entity.getUpAdm());
        response.setUpDate(entity.getUpDate());
        response.setDelAdm(entity.getDelAdm());
        response.setDelDate(entity.getDelDate());
        return response;
    }

    private static List<String> extractTags(SqlProblem entity) {
        // List<String> 그대로 반환 (null-safe)
        List<String> tags = entity.getTags();
        return (tags == null) ? Collections.emptyList() : tags;
    }

}
