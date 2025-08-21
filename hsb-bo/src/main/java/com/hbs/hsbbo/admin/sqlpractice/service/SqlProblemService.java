package com.hbs.hsbbo.admin.sqlpractice.service;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblemSchema;
import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblemTestcase;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.TestcaseVisibility;
import com.hbs.hsbbo.admin.sqlpractice.dto.request.ProblemRequest;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.ProblemDetailResponse;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.ProblemListResponse;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.SqlSchemaDto;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.SqlTcDto;
import com.hbs.hsbbo.admin.sqlpractice.repository.SqlProblemRepository;
import com.hbs.hsbbo.admin.sqlpractice.repository.SqlProblemSchemaRepository;
import com.hbs.hsbbo.admin.sqlpractice.repository.SqlProblemTestcaseRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class SqlProblemService {
    private final SqlProblemRepository problemRepo;
    private final SqlProblemSchemaRepository schemaRepo;
    private final SqlProblemTestcaseRepository testcaseRepo;

    /**
     * 문제 등록
     * - sql_problem(부모) 저장
     * - schema(1개) 세팅
     * - testcases(N개) 세팅
     */
    @Transactional
    public Long createSqlProblem(ProblemRequest req, String adminId) {
        // 안전: 서버에서도 normalize
        req.normalize();

        // 1) 부모 엔티티 생성/세팅
        SqlProblem problem = req.toNewEntity(adminId);
        problem.setUpAdm(adminId);
        problem.setUpDate(LocalDateTime.now());

        // 2) 스키마 (논리 1:1) – 자식 생성 후 부모에 부착
        SqlProblemSchema schema = SqlProblemSchema.builder()
                .ddlScript(req.getSchema().getDdlScript())
                .seedScript(req.getSchema().getSeedScript())
                .build();
        problem.setSchemaCascade(schema); // 기존 제거 + 새 스키마 1개 설정

        // 3) 테스트케이스 목록 생성/부착 (확장 필드 포함)
        List<SqlProblemTestcase> tcs = new ArrayList<>();
        for (ProblemRequest.SqlTestcaseRequest t : req.getTestcases()) {
            SqlProblemTestcase tc = SqlProblemTestcase.builder()
                    .name(t.getName())
                    .visibility(TestcaseVisibility.valueOf(t.getVisibility()))
                    .expectedSql(t.getExpectedSql())
                    .seedOverride(t.getSeedOverride())
                    .noteMd(t.getNoteMd())
                    .sortNo(t.getSortNo())
                    // 채점 기준 확장 필드
                    .expectedMode(t.getExpectedMode())
                    .expectedMetaJson(trimOrNull(t.getExpectedMetaJson()))
                    .assertSql(trimOrNull(t.getAssertSql()))
                    .expectedRows(t.getExpectedRows())
                    .orderSensitiveOverride(t.getOrderSensitiveOverride())
                    .build();
            tcs.add(tc);
        }
        problem.addAllTestcases(tcs);

        // 4) 부모만 저장하면 자식은 cascade로 저장
        SqlProblem saved = problemRepo.save(problem);
        return saved.getId();
    }

    /**
     * 문제 수정
     * - 코어 변경
     * - 스키마 교체
     * - 테스트케이스 전체 교체(orphanRemoval=true)
     */
    @Transactional
    public void updateSqlProblem(Long id, ProblemRequest req, String upAdm) {
        req.normalize();

        SqlProblem problem = problemRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + id));

        // 1) 코어 변경
        problem.changeCore(
                req.getTitle(),
                req.getLevel(),
                req.getTags(),
                req.getDescriptionMd(),
                req.getConstraintRule(),
                Boolean.TRUE.equals(req.getOrderSensitive())
        );
        if (req.getUseTf() != null) problem.setUseYn(req.getUseTf());
        problem.setUpAdm(upAdm);
        problem.setUpDate(LocalDateTime.now());

        // 2) 스키마 교체
        SqlProblemSchema newSchema = SqlProblemSchema.builder()
                .ddlScript(req.getSchema().getDdlScript())
                .seedScript(req.getSchema().getSeedScript())
                .build();
        problem.setSchemaCascade(newSchema);

        // 3) 테스트케이스 교체 (확장 필드 포함)
        List<SqlProblemTestcase> newTcs = new ArrayList<>();
        for (ProblemRequest.SqlTestcaseRequest t : req.getTestcases()) {
            SqlProblemTestcase tc = SqlProblemTestcase.builder()
                    .name(t.getName())
                    .visibility(TestcaseVisibility.valueOf(t.getVisibility()))
                    .expectedSql(t.getExpectedSql())
                    .seedOverride(t.getSeedOverride())
                    .noteMd(t.getNoteMd())
                    .sortNo(t.getSortNo())
                    // ▼ 확장 필드
                    .expectedMode(t.getExpectedMode())
                    .expectedMetaJson(trimOrNull(t.getExpectedMetaJson()))
                    .assertSql(trimOrNull(t.getAssertSql()))
                    .expectedRows(t.getExpectedRows())
                    .orderSensitiveOverride(t.getOrderSensitiveOverride())
                    .build();
            newTcs.add(tc);
        }
        problem.replaceTestcases(newTcs);
        // flush는 트랜잭션 종료 시점
    }

    /**
     * 문제 삭제(Soft Delete)
     * - 실제 삭제가 아닌 del_tf = 'Y' 처리
     * @param id 삭제 대상 문제 ID
     * @param adminId 삭제 관리자 ID
     */
    @Transactional
    public void softDeleteSqlProblem(Long id, String adminId) {
        SqlProblem entity = problemRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Problem not found"));
        entity.softDelete();
        entity.setDelAdm(adminId);
        entity.setDelDate(java.time.LocalDateTime.now());
    }

    /**
     * 문제 사용 여부 변경
     * @param id 문제 ID
     * @param useTf 사용 여부 (Y/N)
     */
    @Transactional
    public void toggleUseTf(Long id, String nextUseTf, String upAdm) {
        SqlProblem problem = problemRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + id));
        problem.setUseYn(nextUseTf);
        problem.setUpAdm(upAdm);
        problem.setUpDate(LocalDateTime.now());
    }

    /**
     * 문제 상세 조회
     * @param id 문제 ID
     * @return 문제 상세 응답 DTO
     */
    /** 상세 조회 (필요 시 연관 강제 로딩) */
    @Transactional
    public SqlProblem getDetail(Long id) {
        SqlProblem problem = problemRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + id));

        // 지연로딩 강제 초기화가 필요하면 접근하여 초기화
        if (problem.getSchema() != null) {
            problem.getSchema().getDdlScript(); // touch
        }
        problem.getTestcases().size(); // touch
        return problem;
    }

    /**
     * 문제 상세 조회 DTO 매핑
     * @param id 문제 ID
     * @return 문제 상세 응답 DTO
     */
    /** 상세 조회 (필요 시 연관 강제 로딩) */
    @Transactional
    public ProblemDetailResponse getDetailDto(Long id) {
        SqlProblem p = problemRepo.findDetail(id)
                .orElseThrow(() -> new EntityNotFoundException("문제를 찾을 수 없습니다. id=" + id));

        // 스키마: 단일 관계라면 p.getSchema(), 만약 리스트도 존재한다면 우선순위에 맞춰 선택
        SqlProblemSchema schema = p.getSchema();
        SqlSchemaDto schemaDto = (schema == null)
                ? new SqlSchemaDto("", "")
                : new SqlSchemaDto(
                nullToEmpty(schema.getDdlScript()),
                nullToEmpty(schema.getSeedScript())
        );

        // 테스트케이스 매핑 (정렬 보장 필요하면 엔티티에 @OrderBy, 아니면 여기서 sort)
        List<SqlTcDto> tcDtos = p.getTestcases().stream()
                .sorted(Comparator.comparing(tc -> Optional.ofNullable(tc.getSortNo()).orElse(0)))
                .map(tc -> new SqlTcDto(
                        tc.getId(),
                        nte(tc.getName()),
                        safeEnum(tc.getVisibility()),      // "PUBLIC"/"HIDDEN"
                        safeEnum(tc.getExpectedMode()),    // "RESULT_SET"...
                        nte(tc.getExpectedSql()),
                        tc.getExpectedRows(),
                        nte(tc.getAssertSql()),
                        nte(tc.getExpectedMetaJson()),
                        tc.getOrderSensitiveOverride(),
                        nte(tc.getSeedOverride()),
                        nte(tc.getNoteMd()),
                        tc.getSortNo()
                ))
                .toList();

        return new ProblemDetailResponse(
                p.getId(),
                nte(p.getTitle()),
                p.getLevel(),
                Optional.ofNullable(p.getTags()).orElse(List.of()),
                nte(p.getDescriptionMd()),
                p.getConstraintRule(),                // ENUM
                Boolean.TRUE.equals(p.isOrderSensitive()),
                nte(p.getUseTf()),                    // "Y"/"N"
                schemaDto,
                tcDtos
        );
    }

    private static String nte(String s) { return s == null ? "" : s; }
    private static String nullToEmpty(String s) { return s == null ? "" : s; }
    private static String safeEnum(Enum<?> e) { return e == null ? "" : e.name(); }

    /**
     * 문제 목록 조회 (검색 + 페이징)
     * @param keyword 제목/내용 검색어
     * @param level 문제 난이도
     * @param rule 제약 조건 규칙
     * @param useTf 사용 여부 (Y/N)
     * @param pageable 페이지/정렬 정보
     * @return 페이징 처리된 문제 목록 응답 DTO
     */
    @Transactional
    public ProblemListResponse getSqlProblemList(
            String keyword, Integer level, ConstraintRule rule, int page, int size, String useTf
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<SqlProblem> result = problemRepo.search(
                (keyword == null || keyword.isBlank()) ? null : keyword.trim(),
                level,
                rule,
                (useTf == null || useTf.isBlank()) ? null : useTf,
                pageable
        );
        return ProblemListResponse.of(result);
    }

    /* --------- small helper --------- */
    private static String trimOrNull(String s) {
        return (s == null) ? null : s.trim();
    }
}
