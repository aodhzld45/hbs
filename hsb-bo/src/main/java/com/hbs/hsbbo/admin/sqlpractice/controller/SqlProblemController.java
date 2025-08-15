package com.hbs.hsbbo.admin.sqlpractice.controller;

import com.hbs.hsbbo.admin.sqlpractice.dto.request.ProblemRequest;
import com.hbs.hsbbo.admin.sqlpractice.service.SqlProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/sql-problems")
@RequiredArgsConstructor
public class SqlProblemController {

    private final SqlProblemService sqlProblemService;

    // =========================
    // 생성 (JSON 본문 기준)
    // =========================
    // JSON 본문 등록
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProblemRequest req,
                                    @RequestParam String adminId,
                                    UriComponentsBuilder uriBuilder) {
        try {
            Long id = sqlProblemService.create(req, adminId);
            return ResponseEntity
                    .created(uriBuilder.path("/api/sql-problems/{id}").buildAndExpand(id).toUri())
                    .body(id);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("문제 등록에 실패했습니다: " + e.getMessage());
        }
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
            Long id = sqlProblemService.create(req, adminId);
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
