package com.hbs.hsbbo.admin.ai.kb.service;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbSource;
import com.hbs.hsbbo.admin.ai.kb.dto.request.KbSourceRequest;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbSourceListResponse;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbSourceResponse;
import com.hbs.hsbbo.admin.ai.kb.repository.KbSourceRepository;
import com.hbs.hsbbo.common.exception.CommonException.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KbSourceService {
    private final KbSourceRepository kbSourceRepository;

    // 목록 (페이징 + 필터)
    @Transactional(readOnly = true)
    public KbSourceListResponse list(
            Long siteKeyId,
            String useTf,
            String keyword,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);

        Long skId = siteKeyId;                 // 숫자는 그대로
        String use = normalizeFlag(useTf);     // "Y"/"N"/null
        String kw  = normalize(keyword);

        Page<KbSource> result = kbSourceRepository.search(
                skId,
                use,
                kw,
                pageable
        );

        List<KbSourceResponse> items = result.getContent().stream()
                .map(KbSourceResponse::from)
                .toList();

        return KbSourceListResponse.of(
                items,
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    // 단건 조회
    @Transactional(readOnly = true)
    public KbSourceResponse get(Long id) {
        KbSource e = kbSourceRepository.findById(id)
                .filter(x -> "N".equals(x.getDelTf()))
                .orElseThrow(() -> new NotFoundException("KB Source를 찾을 수 없습니다. id=%d", id));
        return KbSourceResponse.from(e);
    }

    // 등록(create)
    public Long create(KbSourceRequest request, String actor) {
        // 기본값/정리
        Long siteKeyId = request.getSiteKeyId();
        String name = normalizeRequired(request.getSourceName(), "sourceName");
        String desc = normalizeNullable(request.getDescription());

        // 중복 방지: siteKeyId + sourceName 기준
         if (kbSourceRepository.existsBySiteKeyIdAndSourceNameAndDelTf(siteKeyId, name, "N")) {
             throw new IllegalArgumentException("이미 존재하는 KB Source 입니다: " + name);
         }

        KbSource e = new KbSource();
        applyFromRequest(e, request, true);
        e.setSiteKeyId(siteKeyId);
        e.setSourceName(name);
        e.setDescription(desc);

        e.setRegAdm(actor);
        e.setUseTf(flag(request.getUseTf())); // null "Y"
        e.setDelTf("N");

        kbSourceRepository.save(e);
        return e.getId();
    }

    // 수정(update)
    public Long update(Long id, KbSourceRequest request, String actor) {
        KbSource e = kbSourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("KB Source를 찾을 수 없습니다. id=%d", id));

        if ("Y".equals(e.getDelTf())) {
            throw new IllegalStateException("삭제된 KB Source는 수정할 수 없습니다. id=" + id);
        }

        // siteKeyId 변경 허용 여부는 정책에 따라 결정
        if (request.getSiteKeyId() != null) {
            e.setSiteKeyId(request.getSiteKeyId());
        }
        if (request.getSourceName() != null) {
            e.setSourceName(normalizeRequired(request.getSourceName(), "sourceName"));
        }
        if (request.getDescription() != null) {
            e.setDescription(normalizeNullable(request.getDescription()));
        }
        if (request.getUseTf() != null) {
            e.setUseTf(flag(request.getUseTf()));
        }

        e.setUpAdm(actor);
        e.setUpDate(LocalDateTime.now());
        kbSourceRepository.save(e);
        return e.getId();
    }

    // 사용 여부 토글 (use_tf)
    public Long toggleUse(Long id, String actor) {
        KbSource e = kbSourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("KB Source를 찾을 수 없습니다. id=%d", id));

        if ("Y".equals(e.getDelTf())) {
            throw new IllegalStateException("이미 삭제된 KB Source는 사용 여부를 변경할 수 없습니다.");
        }

        e.setUseTf("Y".equals(e.getUseTf()) ? "N" : "Y");
        e.setUpAdm(actor);
        e.setUpDate(LocalDateTime.now());
        return e.getId();
    }

    // 소프트 삭제 (del_tf='Y')
    public Long logicalDelete(Long id, String actor) {
        KbSource e = kbSourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("KB Source를 찾을 수 없습니다. id=%d", id));

        if ("Y".equals(e.getDelTf())) {
            return e.getId(); // 이미 삭제된 경우 반환
        }

        e.setDelTf("Y");
        e.setDelAdm(actor);
        e.setDelDate(LocalDateTime.now());
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

    private void applyFromRequest(KbSource e, KbSourceRequest dto, boolean isCreate) {
        // create: 기본값 세팅
        if (isCreate) {
            e.setUseTf(flag(dto.getUseTf()));
            e.setDelTf("N");
        } else {
            if (dto.getUseTf() != null) {
                e.setUseTf(flag(dto.getUseTf()));
            }
        }
    }

    private String normalize(String s) {
        if (s == null || s.isBlank()) return null;
        return s.trim();
    }

    private String normalizeRequired(String s, String field) {
        String v = normalize(s);
        if (v == null) throw new IllegalArgumentException(field + " is required");
        return v;
    }

    private String normalizeNullable(String s) {
        return normalize(s);
    }

    private String normalizeFlag(String s) {
        if (s == null || s.isBlank()) return null;
        String v = s.trim().toUpperCase();
        return ("Y".equals(v) || "N".equals(v)) ? v : null;
    }

    private String flag(String s) {
        return ("Y".equalsIgnoreCase(s)) ? "Y" : "N";
    }

}
