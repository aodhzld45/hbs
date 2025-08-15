package com.hbs.hsbbo.admin.sqlpractice.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProblemListResponse {
    private List<ProblemResponse> items;
    private long totalCount;
    private int totalPages;

    public static ProblemListResponse of(org.springframework.data.domain.Page<SqlProblem> page) {
        List<ProblemResponse> items = page.getContent().stream()
                .map(ProblemResponse::fromEntity)
                .toList();
        return new ProblemListResponse(items, page.getTotalElements(), page.getTotalPages());
    }
}

