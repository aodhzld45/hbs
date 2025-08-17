package com.hbs.hsbbo.admin.sqlpractice.controller;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import com.hbs.hsbbo.admin.sqlpractice.dto.request.ProblemRequest;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.ProblemListResponse;
import com.hbs.hsbbo.admin.sqlpractice.service.SqlProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@RestController
@RequestMapping("/api/sql-problems")
@RequiredArgsConstructor
public class SqlProblemController {

    private final SqlProblemService sqlProblemService;

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProblemRequest req,
                                    @RequestParam String adminId,
                                    UriComponentsBuilder uriBuilder) {
        try {
            req.normalize(); // 요청값 정규화 적용
            Long id = sqlProblemService.createSqlProblem(req, adminId);
            return ResponseEntity
                    .created(uriBuilder.path("/{id}")
                            .buildAndExpand(id)
                            .toUri())
                    .body(Map.of("id", id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문제 등록에 실패했습니다: " + e.getMessage());
        }
    }

    /** 목록/검색 + 페이징 */
    @GetMapping
    public ProblemListResponse list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer level,
            @RequestParam(required = false) ConstraintRule rule, // SELECT_ONLY | DML_ALLOWED (정확히 매칭)
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String useTf        // Y | N
    ) {
        return sqlProblemService.getSqlProblemList(keyword, level, rule, page, size, useTf);
    }

    /** 상세 */
    @GetMapping("/{id}")
    public SqlProblem get(@PathVariable Long id) {
        return sqlProblemService.getDetail(id);
    }

    /** 수정(JSON) */
    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @Valid @RequestBody ProblemRequest req,
                       @RequestParam String adminId) {
        sqlProblemService.updateSqlProblem(id, req, adminId);
    }

    /** 소프트 삭제 */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @RequestParam String adminId) {
        sqlProblemService.softDeleteSqlProblem(id, adminId);
    }

    /** 사용 여부 토글/변경 */
    @PatchMapping("/{id}/use-tf")
    public void setUseTf(@PathVariable Long id, @RequestParam String useTf, String adminId) {
        sqlProblemService.toggleUseTf(id, useTf, adminId);
    }

    // =========================
    // (옵션) form-data를 보낼 경우를 대비한 대안 예시
    //  - 프론트에서 multipart/form-data로 보낸다면 @ModelAttribute로 전환
    //  - 파일 업로드 없더라도 운영상 form-data를 선호하면 이 라우트를 사용
    // =========================
    @PostMapping("/form")
    public ResponseEntity<?> createByForm(@Valid @ModelAttribute ProblemRequest req,
                                          @RequestParam String adminId,
                                          UriComponentsBuilder uriBuilder) {
        try {
            Long id = sqlProblemService.createSqlProblem(req, adminId);
            return ResponseEntity
                    .created(uriBuilder.path("/api/sql-problems/{id}").buildAndExpand(id).toUri())
                    .body(id);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문제 등록(form-data)에 실패했습니다: " + e.getMessage());
        }
    }

}
