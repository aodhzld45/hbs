package com.hbs.hsbbo.admin.ai.sitekey.service;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status;
import com.hbs.hsbbo.admin.ai.sitekey.dto.PagedResponse;
import com.hbs.hsbbo.admin.ai.sitekey.dto.mapper.SiteKeyMapper;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyCreateRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyQuery;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyStatusRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyUpdateRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.response.SiteKeyResponse;
import com.hbs.hsbbo.admin.ai.sitekey.dto.response.SiteKeySummaryResponse;
import com.hbs.hsbbo.admin.ai.sitekey.repository.SiteKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.hbs.hsbbo.common.exception.CommonException.*;

@Service
@RequiredArgsConstructor
public class SiteKeyService {
    private final SiteKeyRepository siteKeyRepository;

    // Create
    @Transactional
    public SiteKeyResponse create(SiteKeyCreateRequest req, String actor) {
        // 1) 기본 유효성(서버단) + 중복 검사
        String key = req.getSiteKey() == null ? null : req.getSiteKey().trim();
        if (key == null || key.isEmpty()) throw new BadRequestException("siteKey is required");
        if (siteKeyRepository.existsBySiteKey(key)) {
            throw new ConflictException("siteKey already exists: " + key);
        }

        // 2) 도메인 정제/검증
        List<String> normalizedDomains = normalizeDomains(req.getAllowedDomains());
        validateDomains(normalizedDomains);

        // 3) 엔티티 생성 & 저장
        req.setAllowedDomains(normalizedDomains);
        SiteKey entity = SiteKeyMapper.toEntity(req, actor);
        entity = siteKeyRepository.save(entity);

        // 4) 결과
        return SiteKeyMapper.toResponse(entity);
    }

    // update
    @Transactional
    public SiteKeyResponse update(Long id, SiteKeyUpdateRequest req, String actor) {
        SiteKey entity = siteKeyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("siteKey not found: id=" + id));

        // allowedDomains 업데이트가 들어오면 정제/검증
        if (req.getAllowedDomains() != null) {
            List<String> normalized = normalizeDomains(req.getAllowedDomains());
            validateDomains(normalized);
            req.setAllowedDomains(normalized);
        }

        // 부분 합쳐서 머지 업데이트
        SiteKeyMapper.applyUpdate(entity, req, actor);
        // JPA 더티 체킹 → flush 시 업데이트
        return SiteKeyMapper.toResponse(entity);
    }

    // Staus 변경
    @Transactional
    public SiteKeyResponse changeStatus(Long id, SiteKeyStatusRequest req, String actor) {
        Status st = Status.parseOrDefault(req.getStatus(), null);
        if (st == null) throw new BadRequestException("invalid status: " + req.getStatus());

        int updated = siteKeyRepository.updateStatus(id, st, actor);
        if (updated == 0) throw new NotFoundException("siteKey not found: id=" + id);

        // 변경 후 엔티티 조회
        SiteKey entity = siteKeyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("siteKey not found: id=" + id));
        if (req.getNotes() != null && !req.getNotes().isBlank()) {
            entity.setNotes(trimOrNull(req.getNotes())); // 필요시 상태 변경 사유 기록
        }
        return SiteKeyMapper.toResponse(entity);
    }

    // 사용 여부 변경
    public Long updateUseTf(Long id, String newUseTf, String actor)
    {
        SiteKey siteKey = siteKeyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사이트키 ID입니다."));
        siteKey.setUseTf(newUseTf);
        siteKey.setUpAdm(actor);
        siteKey.setUpDate(LocalDateTime.now());

        return siteKeyRepository.save(siteKey).getId();
    }

    // 삭제
    public Long deleteSiteKey(Long id, String actor)
    {
        SiteKey siteKey = siteKeyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사이트키 ID입니다."));
        siteKey.setDelTf("Y");
        siteKey.setDelAdm(actor);
        siteKey.setDelDate(LocalDateTime.now());

        return siteKeyRepository.save(siteKey).getId();

    }

    // 조회
    @Transactional(readOnly = true)
    public SiteKeyResponse get(Long id) {
        SiteKey e = siteKeyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("siteKey not found: id=" + id));
        return SiteKeyMapper.toResponse(e);
    }

    @Transactional(readOnly = true)
    public SiteKeyResponse getBySiteKey(String siteKey) {
        SiteKey e = siteKeyRepository.findBySiteKey(siteKey)
                .orElseThrow(() -> new NotFoundException("siteKey not found: " + siteKey));
        return SiteKeyMapper.toResponse(e);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SiteKeySummaryResponse> search(SiteKeyQuery req) {

        SiteKeyQuery query = SiteKeyQuery.builder()
                .keyword(Optional.ofNullable(req.getKeyword()).map(String::trim).orElse(null))
                .planCode(Optional.ofNullable(req.getPlanCode()).map(String::trim).orElse(null))
                .status(Optional.ofNullable(req.getStatus()).map(String::trim).orElse(null))
                .page(Optional.ofNullable(req.getPage()).orElse(0))
                .size(Optional.ofNullable(req.getSize()).orElse(20))
                .sort(Optional.ofNullable(req.getSort()).filter(s->!s.isBlank()).orElse("regDate,desc"))
                .includeDeleted(Optional.ofNullable(req.getIncludeDeleted()).orElse(false))
                .use(req.getUse())  // 'Y' | 'N' | null
                .build();

        Page<SiteKey> page = siteKeyRepository.search(query);

        return PagedResponse.<SiteKeySummaryResponse>builder()
                .content(page.getContent()
                        .stream()
                        .map(SiteKeyMapper::toSummary)
                        .collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }


    // 서버 런타임 검증(위젯/API용)
    @Transactional(readOnly = true)
    public SiteKey assertActiveAndDomainAllowed(String siteKey, String clientDomain) {
        SiteKey sk = siteKeyRepository.findBySiteKey(siteKey)
                .orElseThrow(() -> new NotFoundException("siteKey not found"));

        if (!sk.isActive()) throw new ForbiddenException("siteKey inactive: " + sk.getStatus());

        // Origin/Referer 없을 수 있는 서버사이드 호출 대비: clientDomain null 허용 여부는 정책에 따름
        if (clientDomain == null || clientDomain.isBlank()) {
            throw new ForbiddenException("client domain required");
        }
        if (!sk.isDomainAllowed(clientDomain)) {
            throw new ForbiddenException("domain not allowed: " + clientDomain);
        }
        return sk;
    }

    /* =========================
     * Helpers - 각종 유틸들 나중에 공통으로 분리 예정.
     * ========================= */
    private List<String> normalizeDomains(List<String> input) {
        if (input == null) return List.of();
        // 공백 제거, 소문자화, 중복 제거, 빈 문자열 제거
        LinkedHashSet<String> set = new LinkedHashSet<>();
        for (String d : input) {
            if (d == null) continue;
            String s = d.trim().toLowerCase();
            if (!s.isEmpty()) set.add(s);
        }
        return new ArrayList<>(set);
    }

    private void validateDomains(List<String> domains) {
        if (domains == null) return;
        // 기본 길이/갯수 제약(정책에 맞게 조정)
        if (domains.size() > 200) throw new BadRequestException("too many allowed domains");
        for (String d : domains) {
            if (d.length() > 255) throw new BadRequestException("domain too long: " + d);
            // 간단 패턴: 와일드카드 또는 호스트
            if (d.startsWith("*.")) {
                String rest = d.substring(2);
                if (!isHostLike(rest)) throw new BadRequestException("invalid wildcard domain: " + d);
            } else {
                if (!isHostLike(d)) throw new BadRequestException("invalid domain: " + d);
            }
        }
    }

    private boolean isHostLike(String host) {
        // 매우 간단한 호스트 유효성 (필요시 정규식/라이브러리 강화)
        // 알파벳/숫자/하이픈/점, 점으로 구분된 라벨, 라벨은 1~63, 전체 253 이내…
        // 여기서는 최소한의 체크만 수행
        if (host == null || host.isBlank()) return false;
        if (host.startsWith(".") || host.endsWith(".")) return false;
        if (host.contains("..")) return false;
        return host.chars().allMatch(c ->
                Character.isLetterOrDigit(c) || c == '-' || c == '.'
        );
    }

    private String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }


}
