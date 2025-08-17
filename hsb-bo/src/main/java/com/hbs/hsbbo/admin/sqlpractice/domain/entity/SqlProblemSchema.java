package com.hbs.hsbbo.admin.sqlpractice.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "sql_schema",
        indexes = {
                @Index(name = "idx_sql_schema_problem_id", columnList = "problem_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "problem")
@EqualsAndHashCode(of = "id")
public class SqlProblemSchema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 부모 문제 (FK: problem_id)
     *  - 부모(SqlProblem)의 @OneToMany(mappedBy="problem", cascade=ALL, orphanRemoval=true)와 짝
     *  - DB에 ON DELETE CASCADE가 있으므로 하이버네이트에도 힌트를 남겨둡니다(선택).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // 선택: DB가 FK cascade를 수행할 때 하이버네이트에도 알려줌
    private SqlProblem problem;

    /** DDL 스크립트 (MEDIUMTEXT) */
    @Lob
    @Column(name = "ddl_script", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String ddlScript;

    /** SEED 스크립트 (MEDIUMTEXT) */
    @Lob
    @Column(name = "seed_script", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String seedScript;

    /* ==========================================================
       보조 편의 메서드 (가능하면 부모의 setSchemaCascade/addSchema를 주로 사용하세요)
       ========================================================== */

    /**
     * 이 스키마를 지정한 문제에 부착합니다.
     * - 기존 parent가 있으면 부모 컬렉션에서 제거
     * - 새 parent의 컬렉션에 추가
     */
    public void attachTo(SqlProblem parent) {
        if (this.problem == parent) return;
        // 기존 부모에서 분리
        if (this.problem != null) {
            this.problem.removeSchema(this); // 부모 편의 메서드가 problem=null 처리
        }
        // 새 부모에 부착
        if (parent != null) {
            parent.addSchema(this);          // 부모 편의 메서드가 problem=this 세팅
        } else {
            this.problem = null;
        }
    }
}
