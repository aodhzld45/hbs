package com.hbs.hsbbo.admin.sqlpractice.dto.request;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * SQL 문제 생성/수정 요청 DTO (payload 1:1)
 * - 프론트의 ProblemPayload와 동일 구조
 * - create/update 공용으로 사용 (옵션 필드 허용)
 */
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ProblemRequest {

    // ===== sql_problem =====
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

    // ===== sql_schema =====
    @Valid
    @NotNull
    private SqlSchemaRequest schema;

    // ===== sql_testcase[] =====
    @Valid
    @NotEmpty
    private List<SqlTestcaseRequest> testcases;

    // -------- Nested DTOs --------
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SqlSchemaRequest {
        @NotBlank
        private String ddlScript;
        @NotBlank
        private String seedScript;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SqlTestcaseRequest {
        @NotBlank
        private String name;

        @Pattern(regexp = "PUBLIC|HIDDEN")
        private String visibility;          // enum으로 승격해도 OK

        @NotBlank
        private String expectedSql;        // 기준/정답 SQL

        private String seedOverride;       // 옵션 seed
        private String noteMd;              // optional
        private Integer sortNo;             // optional (null이면 뒤에서 index로 채움)

        @NotNull
        private ExpectedMode expectedMode; // 새 필드

        private String expectedMetaJson;   // JSON 문자열(선택)
        private String assertSql;          // CUSTOM_ASSERT/보조검증
        private Integer expectedRows;      // DML용
        private Boolean orderSensitiveOverride; // null이면 문제 기본값
    }

    public enum ExpectedMode {
        SQL_EQUAL, SQL_AST_PATTERN, RESULT_SET, AFFECTED_ROWS, STATE_SNAPSHOT, CUSTOM_ASSERT
    }

    // =========================
    // 정규화(서버 보호용, 선택)
    // =========================
    public void normalize() {
        if (title != null) title = title.trim();
        if (descriptionMd != null) descriptionMd = descriptionMd.trim();
        if (useTf == null || useTf.isBlank()) useTf = "Y";
        if (orderSensitive == null) orderSensitive = Boolean.FALSE;

        if (tags != null) {
            tags = tags.stream()
                    .map(t -> t == null ? null : t.trim())
                    .filter(t -> t != null && !t.isEmpty())
                    .distinct()
                    .toList();
        }

        if (schema != null) {
            if (schema.ddlScript != null) schema.ddlScript = schema.ddlScript.trim();
            if (schema.seedScript != null) schema.seedScript = schema.seedScript.trim();
        }

        if (testcases != null) {
            List<SqlTestcaseRequest> list = new ArrayList<>();
            for (int i = 0; i < testcases.size(); i++) {
                SqlTestcaseRequest tc = testcases.get(i);
                if (tc.getName() != null) tc.setName(tc.getName().trim());
                if (tc.getNoteMd() != null) tc.setNoteMd(tc.getNoteMd().trim());
                if (tc.getSeedOverride() != null) tc.setSeedOverride(tc.getSeedOverride().trim());
                if (tc.getExpectedSql() != null) {
                    // 끝의 ; 제거 + trim
                    tc.setExpectedSql(tc.getExpectedSql().replaceAll(";+$", "").trim());
                }
                if (tc.getSortNo() == null) tc.setSortNo(i);
                list.add(tc);
            }
            testcases = list;
        }
    }

    // =========================
    // 엔티티 매핑 헬퍼
    // =========================

    /** 신규 엔티티 생성 (sql_problem만 매핑) — schema/testcases는 서비스에서 별도 저장 */
    public SqlProblem toNewEntity(String regAdm) {
        SqlProblem e = new SqlProblem();
        e.changeCore(
                title,
                level,
                tags,                // @Converter(List<->CSV) 사용 중이면 그대로 세팅
                descriptionMd,
                constraintRule,
                Boolean.TRUE.equals(orderSensitive)
        );
        e.setRegAdm(regAdm);
        e.setUseTf(useTf != null ? useTf : "Y");
        e.setDelTf("N");
        // upAdm/upDate는 service에서 세팅 권장
        return e;
    }

    /** 수정 반영 (sql_problem만) — schema/testcases는 서비스에서 별도 처리 */
    public void applyTo(SqlProblem target, String upAdm) {
        target.changeCore(
                title,
                level,
                tags,
                descriptionMd,
                constraintRule,
                Boolean.TRUE.equals(orderSensitive)
        );
        if (useTf != null) {
            // 프로젝트에 맞게 setUseTf / setUseYn 중 올바른 세터 사용
            // target.setUseTf(useTf);
            target.setUseYn(useTf); // 기존 코드 유지
        }
        target.setUpAdm(upAdm);
    }
}
