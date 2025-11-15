package com.hbs.hsbbo.admin.ai.promptprofile.service;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.request.PromptProfileRequest;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileListResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.repository.PromptProfileRepository;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
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

    // 등록(create)
    public Long create(PromptProfileRequest request, String actor) {
        PromptProfile e = new PromptProfile();
        applyFromRequest(e, request, true);
        e.setRegAdm(actor);
        promptProfileRepository.save(e); // e.getId() 확보

        // 3) 선택: 사이트키와 매핑 (linkedSiteKeyId가 있을 때만)
        if (request.getLinkedSiteKeyId() != null) {
            SiteKey sk = siteKeyRepository.findByIdForUpdate(request.getLinkedSiteKeyId())
                    .orElseThrow(() -> new IllegalArgumentException("사이트키가 존재하지 않습니다. id=" + request.getLinkedSiteKeyId()));

            // 여기서 매핑: site_key.default_prompt_profile_id = 프롬프트 프로필 id
            sk.setDefaultPromptProfileId(e);
            sk.setUpAdm(actor);
            siteKeyRepository.save(sk);
        }
        
        return e.getId();
    }
    
    // 수정(update)
    public Long update(Long id, PromptProfileRequest request, String actor) {
        PromptProfile e = promptProfileRepository.findById(id).orElseThrow();
        applyFromRequest(e, request, false);
        e.setUpAdm(actor);
        // @Transactional 이므로 flush는 트랜잭션 종료 시점에
        
        // 사이트키 매핑: linkedSiteKeyId가 넘어오면 해당 SiteKey에 이 프롬프트 프로필을 기본으로 설정
        if (request.getLinkedSiteKeyId() != null) {
            SiteKey sk = siteKeyRepository.findByIdForUpdate(request.getLinkedSiteKeyId())
                    .orElseThrow(() -> new IllegalArgumentException("사이트키가 존재하지 않습니다. id=" + request.getLinkedSiteKeyId()));

            // 여기서 매핑: site_key.default_prompt_profile_id = 프롬프트 프로필 id
            sk.setDefaultPromptProfileId(e);
            sk.setUpAdm(actor);
            siteKeyRepository.save(sk);
        }

        return e.getId();
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

    private void applyFromRequest(PromptProfile e, PromptProfileRequest dto, boolean isCreate) {
        // 기본 식별/태깅
        e.setTenantId(normalize(dto.getTenantId()));
        e.setName(dto.getName());         // @NotBlank 이므로 그대로
        e.setPurpose(dto.getPurpose());

        // 모델/파라미터
        e.setModel(dto.getModel());
        e.setTemperature(dto.getTemperature());
        e.setTopP(dto.getTopP());
        e.setMaxTokens(dto.getMaxTokens());
        e.setSeed(dto.getSeed());
        e.setFreqPenalty(dto.getFreqPenalty());
        e.setPresencePenalty(dto.getPresencePenalty());
        e.setStopJson(dto.getStopJson());

        // 프롬프트 리소스
        e.setSystemTpl(dto.getSystemTpl());
        e.setGuardrailTpl(dto.getGuardrailTpl());
        e.setStyleJson(dto.getStyleJson());
        e.setToolsJson(dto.getToolsJson());
        e.setPoliciesJson(dto.getPoliciesJson());

        // 상태/버전
        if (dto.getVersion() != null) {
            e.setVersion(dto.getVersion());
        } else if (isCreate && e.getVersion() == null) {
            e.setVersion(1);
        }

        if (dto.getStatus() != null) {
            e.setStatus(dto.getStatus());
        } else if (isCreate && e.getStatus() == null) {
            e.setStatus(PromptStatus.DRAFT);
        }

        // use_tf / del_tf
        if (isCreate) {
            e.setUseTf(flag(dto.getUseTf()));    // null이면 "Y"
            e.setDelTf("N");                     // 신규는 항상 N
        } else {
            if (dto.getUseTf() != null) {
                e.setUseTf(flag(dto.getUseTf()));
            }
            if (dto.getDelTf() != null) {
                e.setDelTf(flag(dto.getDelTf())); // 필요 시 사용, 보통은 logicalDelete()로 처리
            }
        }
    }

    private String trim(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String normalize(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String flag(String s) { return ("Y".equalsIgnoreCase(s)) ? "Y" : "N"; }



}
