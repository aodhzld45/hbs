package com.hbs.hsbbo.admin.sqlpractice.domain.entity;

import com.hbs.hsbbo.admin.sqlpractice.domain.type.TestcaseVisibility;
import com.hbs.hsbbo.admin.sqlpractice.dto.request.ProblemRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "sql_testcase",
        indexes = {
                @Index(name = "idx_sql_testcase_problem_id", columnList = "problem_id"),
                @Index(name = "idx_sql_testcase_problem_sort", columnList = "problem_id, sort_no")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "problem")            // 순환참조 방지
@EqualsAndHashCode(of = "id")             // 식별자 기반 동등성
public class SqlProblemTestcase {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        /** 부모 문제 (FK: problem_id) — 부모는 @OneToMany(mappedBy="problem", cascade=ALL, orphanRemoval=true) */
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "problem_id", nullable = false)
        @OnDelete(action = OnDeleteAction.CASCADE) // (선택) DB FK on delete cascade 힌트
        private SqlProblem problem;

        @Column(name = "name", nullable = false, length = 100)
        private String name;

        @Enumerated(EnumType.STRING)
        @Column(name = "visibility", nullable = false, length = 10)
        private TestcaseVisibility visibility; // PUBLIC / HIDDEN

        // MEDIUMTEXT (nullable)
        @Lob
        @Column(name = "seed_override", columnDefinition = "MEDIUMTEXT")
        private String seedOverride;

        // MEDIUMTEXT
        @Lob
        @Column(name = "expected_sql", nullable = false, columnDefinition = "MEDIUMTEXT")
        private String expectedSql;

        // TEXT (nullable)
        @Lob
        @Column(name = "note_md", columnDefinition = "TEXT")
        private String noteMd;

        @Column(name = "sort_no", nullable = false)
        private Integer sortNo = 0;

        @Enumerated(EnumType.STRING)
        @Column(name = "expected_mode", nullable = false, length = 20)
        private ProblemRequest.ExpectedMode expectedMode = ProblemRequest.ExpectedMode.RESULT_SET;

        @Lob
        @Column(name = "assert_sql", columnDefinition = "MEDIUMTEXT")
        private String assertSql;

        @Column(name = "expected_rows")
        private Integer expectedRows;

        @Column(name = "order_sensitive_override")
        private Boolean orderSensitiveOverride;

        @Column(name = "expected_meta", columnDefinition = "JSON")
        private String expectedMetaJson; // DB JSON ↔ 앱 String 저장 (필요하면 Converter로 Map 변환)

    /* ==========================================================
       보조 편의 메서드 (가능하면 부모 편의 add/remove/replace 사용)
       ========================================================== */

        /**
         * 이 테스트케이스를 지정한 문제에 부착합니다.
         * - 기존 parent가 있으면 부모 컬렉션에서 제거
         * - 새 parent의 컬렉션에 추가
         */
        public void attachTo(SqlProblem parent) {
                if (this.problem == parent) return;
                if (this.problem != null) {
                        this.problem.removeTestcase(this); // 부모 편의메서드가 양방향 정리
                }
                if (parent != null) {
                        parent.addTestcase(this);          // 부모 편의메서드가 problem=this 설정
                } else {
                        this.problem = null;
                }
        }
}
