package com.hbs.hsbbo.admin.sqlpractice.domain.entity;

import com.hbs.hsbbo.admin.sqlpractice.domain.convert.TagsCsvConverter;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

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
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

    /** 사용여부 토글 */
    public void setUseYn(String useTf) {
        // AuditBase.useTf 사용 (Y/N 계약 준수)
        this.setUseTf(("Y".equals(useTf)) ? "Y" : "N");
    }

    /** 소프트 삭제 플래그 */
    public void softDelete() {
        this.setDelTf("Y");
    }
}
