package com.hbs.hsbbo.admin.sqlpractice.dto.request;

import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
/**
 * SQL 문제 생성/수정 요청 DTO (공용)
 * create, update에서 동일한 필드와 제약을 사용
 */
public class ProblemRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    @NotNull
    @Min(1) @Max(5)
    private Integer level;

    @Size(max = 10) // 태그 개수 제한
    private List<@Size(min = 1, max = 30) String> tags;

    @NotBlank
    private String descriptionMd;

    @NotNull
    private ConstraintRule constraintRule;

    @NotNull
    private Boolean orderSensitive;

    @Pattern(regexp = "Y|N")
    private String useTf;
}
