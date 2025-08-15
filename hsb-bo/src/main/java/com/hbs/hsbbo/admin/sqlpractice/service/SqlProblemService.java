package com.hbs.hsbbo.admin.sqlpractice.service;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import com.hbs.hsbbo.admin.sqlpractice.dto.request.ProblemRequest;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.ProblemListResponse;
import com.hbs.hsbbo.admin.sqlpractice.dto.response.ProblemResponse;
import com.hbs.hsbbo.admin.sqlpractice.repository.SqlProblemRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class SqlProblemService {
    private final SqlProblemRepository sqlProblemRepository;

    /**
     * 문제 등록
     * @param req 문제 등록 요청 DTO
     * @param adminId 등록 관리자 ID
     * @return 생성된 문제의 PK (id)
     */
    @Transactional
    public Long createSqlProblem(ProblemRequest req, String adminId) {
        SqlProblem entity = req.toNewEntity(adminId);
        return sqlProblemRepository.save(entity).getId();
    }

    /**
     * 문제 수정
     * @param id 수정 대상 문제 ID
     * @param req 수정 요청 DTO
     * @param adminId 수정 관리자 ID
     */
    @Transactional
    public void updateSqlProblem(Long id, ProblemRequest req, String adminId) {
        SqlProblem entity = sqlProblemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Problem not found"));
        req.applyTo(entity, adminId); // 변경감지
    }

    /**
     * 문제 삭제(Soft Delete)
     * - 실제 삭제가 아닌 del_tf = 'Y' 처리
     * @param id 삭제 대상 문제 ID
     * @param adminId 삭제 관리자 ID
     */
    @Transactional
    public void softDeleteSqlProblem(Long id, String adminId) {
        SqlProblem entity = sqlProblemRepository.findById(id)
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
    public void setUseTfSqlProblem(Long id, String useTf) {
        SqlProblem entity = sqlProblemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Problem not found"));
        entity.setUseYn(useTf);
    }

    /**
     * 문제 상세 조회
     * @param id 문제 ID
     * @return 문제 상세 응답 DTO
     */
    @Transactional
    public ProblemResponse getDetailSqlProblem(Long id) {
        SqlProblem entity = sqlProblemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Problem not found"));
        return ProblemResponse.fromEntity(entity);
    }
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

        Page<SqlProblem> result = sqlProblemRepository.search(
                (keyword == null || keyword.isBlank()) ? null : keyword.trim(),
                level,
                rule,
                (useTf == null || useTf.isBlank()) ? null : useTf,
                pageable
        );
        return ProblemListResponse.of(result);
    }
}
