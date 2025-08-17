package com.hbs.hsbbo.admin.sqlpractice.domain.entity;

import com.hbs.hsbbo.admin.sqlpractice.domain.convert.TagsCsvConverter;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(
        name = "sql_problem",
        indexes = {
                @Index(name = "idx_sql_problem_level", columnList = "level"),
                @Index(name = "idx_sql_problem_use_del", columnList = "use_tf,del_tf")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class SqlProblem extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @ToString.Include
    private Long id;

    /** 문제 제목 */
    @Column(length = 200, nullable = false)
    @ToString.Include
    private String title;

    /** 난이도: 1~5 */
    @Column(nullable = false)
    private Integer level;

    /** 태그: DB에는 csv로 저장, 앱에서는 List로 사용 */
    @Convert(converter = TagsCsvConverter.class)
    @Column(name = "tags", length = 255)
    private List<String> tags;

    /** 문제 설명 (Markdown) */
    @Lob
    @Column(name = "description_md", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String descriptionMd;

    /** 제약 규칙 (SELECT_ONLY | DML_ALLOWED) */
    @Enumerated(EnumType.STRING)
    @Column(name = "constraint_rule", length = 20, nullable = false)
    private ConstraintRule constraintRule = ConstraintRule.SELECT_ONLY;

    /** 결과 비교 시 순서 중요 여부 */
    @Column(name = "order_sensitive", nullable = false)
    private boolean orderSensitive = false;

    /* ===================== 연관관계 ===================== */

    /** 기본 스키마(DDL/SEED). DDL 상 UNIQUE 제약이 없으므로 OneToMany로 매핑하고, 애플리케이션에서 1개만 관리 */
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SqlProblemSchema> schemaList = new ArrayList<>();

    /** 테스트케이스 1:N */
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortNo ASC, id ASC")
    @Builder.Default
    private List<SqlProblemTestcase> testcases = new ArrayList<>();

    /* ===================== 편의 메서드 ===================== */

    /** 제목/설명/옵션 등 주요 값 일괄 변경 */
    public void changeCore(
            String title,
            Integer level,
            List<String> tags,
            String descriptionMd,
            ConstraintRule rule,
            boolean orderSensitive
    ) {
        this.title = title != null ? title.trim() : this.title;
        this.level = level != null ? level : this.level;
        this.tags = tags; // TagsCsvConverter가 정규화 수행
        this.descriptionMd = descriptionMd != null ? descriptionMd : this.descriptionMd;
        this.constraintRule = rule != null ? rule : this.constraintRule;
        this.orderSensitive = orderSensitive;
    }

    /** 사용여부 토글 (AuditBase.useTf 사용) */
    public void setUseYn(String useTf) {
        this.setUseTf(("Y".equals(useTf)) ? "Y" : "N");
    }

    /** 소프트 삭제 플래그 */
    public void softDelete() {
        this.setDelTf("Y");
    }

    /* ===== Schema 편의: 논리적 1:1 관리 ===== */

    /** 현재 스키마 가져오기 (없으면 null) */
    public SqlProblemSchema getSchema() {
        return schemaList.isEmpty() ? null : schemaList.get(0);
    }

    /** 읽기 전용 스키마 목록 제공(필요 시 디버깅/검증용) */
    public List<SqlProblemSchema> getSchemaListUnmodifiable() {
        return Collections.unmodifiableList(this.schemaList);
    }

    /** 스키마 교체 (기존 제거 → 새로 1개 세팅) */
    public void setSchemaCascade(SqlProblemSchema newSchema) {
        // 기존 모두 제거 (orphanRemoval=true 로 DB에서 삭제됨)
        for (SqlProblemSchema s : new ArrayList<>(schemaList)) {
            removeSchema(s);
        }
        if (newSchema != null) addSchema(newSchema);
    }

    /** 스키마 추가 (내부용) */
    public void addSchema(SqlProblemSchema schema) {
        if (schema == null) return;
        this.schemaList.add(schema);
        schema.setProblem(this);
    }

    /** 스키마 제거 (내부용) */
    public void removeSchema(SqlProblemSchema schema) {
        if (schema == null) return;
        this.schemaList.remove(schema);
        schema.setProblem(null);
    }

    /* ===== Testcase 편의 ===== */

    public void addTestcase(SqlProblemTestcase tc) {
        if (tc == null) return;
        this.testcases.add(tc);
        tc.setProblem(this);
    }

    public void addAllTestcases(List<SqlProblemTestcase> list) {
        if (list == null || list.isEmpty()) return;
        for (SqlProblemTestcase tc : list) addTestcase(tc);
    }

    public void removeTestcase(SqlProblemTestcase tc) {
        if (tc == null) return;
        this.testcases.remove(tc);
        tc.setProblem(null);
    }

    /** 테스트케이스 전체 교체 (orphanRemoval=true로 기존 자식 자동 삭제) */
    public void replaceTestcases(List<SqlProblemTestcase> newList) {
        for (SqlProblemTestcase tc : new ArrayList<>(this.testcases)) {
            removeTestcase(tc);
        }
        if (newList != null) {
            for (SqlProblemTestcase tc : newList) addTestcase(tc);
        }
    }
}
