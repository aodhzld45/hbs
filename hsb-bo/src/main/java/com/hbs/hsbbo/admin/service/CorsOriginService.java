package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AppCorsOrigin;
import com.hbs.hsbbo.admin.dto.request.CorsOriginRequest;
import com.hbs.hsbbo.admin.dto.response.CorsOriginListResponse;
import com.hbs.hsbbo.admin.dto.response.CorsOriginResponse;
import com.hbs.hsbbo.admin.repository.CorsOriginRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CorsOriginService {
    private final CorsOriginRepository corsOriginRepository;

    // 조회
    public List<AppCorsOrigin> findAllActive() {
        return corsOriginRepository.findAllActive();
    }

    public List<AppCorsOrigin> findAllActiveByTenant(String tenantId) {
        return corsOriginRepository.findAllActiveByTenant(tenantId);
    }

    public CorsOriginResponse findActiveById(Long id) {
        return corsOriginRepository.findActiveById(id)
                .orElseThrow(() -> new IllegalArgumentException("활성 CORS Origin을 찾을 수 없습니다. id=" + id));
    }

    @Transactional(readOnly = true)
    public CorsOriginListResponse list(String keyword, int page, int size, String sort, String tenantId){
        Pageable pageable = buildPageable(page, size, sort);
        Page<AppCorsOrigin> result = corsOriginRepository.search(keyword, tenantId, pageable);

        List<CorsOriginResponse> items = result.getContent().stream()
                .map(e -> CorsOriginResponse.from(e)) // options 는 상세 조회 시 디코딩 (리스트는 경량)
                .toList();

        return CorsOriginListResponse.of(items, result.getTotalElements(), result.getTotalPages());
    }


    // 생성, 수정
    @Transactional
    public Long create(CorsOriginRequest req, String actor) {
        String originPat = required(req.getOriginPat());
        String tenantId  = normalize(req.getTenantId());
        // req는 @Valid 통과 가정
        AppCorsOrigin entity = new AppCorsOrigin();
        entity.setOriginPat(originPat);
        entity.setDescription(normalize(req.getDescription()));
        entity.setTenantId(tenantId);

        // 공통 필드(AuditBase 가정)
        entity.setUseTf("Y");
        entity.setDelTf("N");
        entity.setRegAdm(actor);
        entity.setRegDate(LocalDateTime.now());
        entity.setUpAdm(actor);
        entity.setUpDate(LocalDateTime.now());

        corsOriginRepository.save(entity);

        return entity.getId();
    }

    @Transactional
    public Long update(Long id, CorsOriginRequest req, String actor) {
        AppCorsOrigin entity = corsOriginRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CORS Origin을 찾을 수 없습니다. id=" + id));

        // 정책: originPat 변경 허용/불허 중 택1
        // 1) 허용 시: null이 아닐 때만 덮어쓰기
        if (req.getOriginPat() != null && !req.getOriginPat().isBlank()) {
            entity.setOriginPat(req.getOriginPat());
        }
        // 2) 불허 시: 위 블록 주석 처리

        // 선택 필드 patch
        if (req.getDescription() != null) {
            entity.setDescription(req.getDescription());
        }
        if (req.getTenantId() != null) {
            entity.setTenantId(req.getTenantId());
        }

        entity.setUpAdm(actor);
        entity.setUpDate(LocalDateTime.now());
        return entity.getId(); // dirty checking
    }

    // 사용 여부 변경
    public Long updateUseTf(Long id, String newUseTf, String actor)
    {
        AppCorsOrigin appCorsOrigin = corsOriginRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 CorsOrigin ID 입니다."));
        appCorsOrigin.setUseTf(newUseTf);
        appCorsOrigin.setUpAdm(actor);
        appCorsOrigin.setUpDate(LocalDateTime.now());

        return corsOriginRepository.save(appCorsOrigin).getId();
    }

    // 소프트 삭제
    public Long deleteAppCorsOrigin(Long id, String actor)
    {
        AppCorsOrigin appCorsOrigin = corsOriginRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 CorsOrigin ID 입니다."));
        appCorsOrigin.setDelTf("Y");
        appCorsOrigin.setDelAdm(actor);
        appCorsOrigin.setDelDate(LocalDateTime.now());

        return corsOriginRepository.save(appCorsOrigin).getId();

    }

    // ===== 유틸 =====
    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
    private static String normalizeFlag(String s) {
        String t = normalize(s);
        return t == null ? null : t.toUpperCase();
    }
    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }
    private static String required(String s) {
        if (!notBlank(s)) throw new IllegalArgumentException("필수 값 누락: originPat");
        return s.trim();
    }

    private Pageable buildPageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
        // 지원 예: "regDate,desc" / "name,asc"
        String[] p = sort.split(",");
        if (p.length == 2) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(p[1].trim()), p[0].trim()));
        }
        return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
    }

}
