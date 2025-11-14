package com.hbs.hsbbo.admin.ai.promptprofile.service;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileListResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.repository.PromptProfileRepository;
import com.hbs.hsbbo.admin.ai.sitekey.repository.SiteKeyRepository;
import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PromptProfileService {

    private final PromptProfileRepository promptProfileRepository;
    private final SiteKeyService siteKeyService;
    private final SiteKeyRepository siteKeyRepository;

    // 프롬프트 프로필 리스트 (페이징 + 키워드,모델 필터)
    @Transactional(readOnly = true)
    public PromptProfileListResponse list(
            String keyword,
            String model,
            int page,
            int size,
            String sort
    ) {
        // 1. 정렬/페이징 변환
        Pageable pageable = buildPageable(page, size, sort);

        // 2. 공백 → null 로 정리
        String kw = normalize(keyword);
        String modelFilter = normalize(model);

        // 3. tenantId / promptStatus 는 일단 전체 조회용으로 null
        Page<PromptProfile> result = promptProfileRepository.search(
                null,          // tenantId
                null,          // promptStatus
                modelFilter,   // model
                kw,            // keyword
                pageable
        );

        // 4. 엔티티 → Response DTO 매핑
        List<PromptProfileResponse> items = result.getContent().stream()
                .map(PromptProfileResponse::from)
                .toList();

        return PromptProfileListResponse.of(
                items,
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    // 단건 조회
    @Transactional(readOnly = true)
    public PromptProfileResponse get(Long id) {
        PromptProfile e = promptProfileRepository.findActiveById(id).orElseThrow();
        return PromptProfileResponse.from(e);
    }

    /** 사용 여부 토글 (use_tf) */
    public Long toggleUse(Long id, String actor) {
        PromptProfile e = promptProfileRepository.findById(id).orElseThrow();
        e.setUseTf("Y".equals(e.getUseTf()) ? "N" : "Y");
        e.setUpAdm(actor);
        return e.getId();
    }

    /** 소프트 삭제 (del_tf='Y') */
    public Long logicalDelete(Long id, String actor) {
        PromptProfile e = promptProfileRepository.findById(id).orElseThrow();
        e.setDelTf("Y");
        e.setDelAdm(actor);
        return e.getId();
    }
    // ---------------------------
    // 내부 헬퍼
    // ---------------------------
    private Pageable buildPageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
        // 지원 예: "regDate,desc" / "name,asc"
        String[] p = sort.split(",");
        if (p.length == 2) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(p[1].trim()), p[0].trim()));
        }
        return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
    }

    private String trim(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String normalize(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String flag(String s) { return ("Y".equalsIgnoreCase(s)) ? "Y" : "N"; }



}
