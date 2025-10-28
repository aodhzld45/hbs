package com.hbs.hsbbo.admin.ai.widgetconfig.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.repository.SiteKeyRepository;
import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity.WidgetConfig;
import com.hbs.hsbbo.admin.ai.widgetconfig.dto.request.WidgetConfigRequest;
import com.hbs.hsbbo.admin.ai.widgetconfig.dto.response.WidgetConfigListResponse;
import com.hbs.hsbbo.admin.ai.widgetconfig.dto.response.WidgetConfigResponse;
import com.hbs.hsbbo.admin.ai.widgetconfig.repository.WidgetConfigRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class WidgetConfigService {
    private final WidgetConfigRepository widgetConfigRepository;
    private final SiteKeyService siteKeyService;
    private final SiteKeyRepository siteKeyRepository;

    private final ObjectMapper om;
    private final FileUtil fileUtil;

    /**
     * 공개 위젯 설정 조회 (hsbs-chat.js 초기 로딩에서 사용)
     * - siteKey + host(Origin/Referer의 host) 검증
     * - 연결된 기본 WidgetConfig를 찾아서 WidgetConfigResponse로 반환
     */
    @Transactional
    public WidgetConfigResponse loadForPublic(String siteKey, String host) {
        if (siteKey == null || siteKey.isBlank()) {
            throw new IllegalArgumentException("사이트키가 비어 있습니다.");
        }

        // 1) 도메인/상태 검증
        if (siteKeyService != null) {
            siteKeyService.assertActiveAndDomainAllowed(siteKey, host); // 실패 시 403 성격 예외
        } else {
            SiteKey sk = siteKeyRepository.findBySiteKey(siteKey)
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 사이트키 입니다."));
            if (!"Y".equalsIgnoreCase(sk.getUseTf()) || "Y".equalsIgnoreCase(sk.getDelTf())) {
                throw new IllegalStateException("비활성화되었거나 삭제된 사이트키 입니다.");
            }
        }

        // 2) 연결된 기본 위젯 설정 식별
        SiteKey sk = siteKeyRepository.findBySiteKey(siteKey)
                .orElseThrow(() -> new IllegalArgumentException("사이트 키 조회 실패"));
        WidgetConfig linked = sk.getDefaultWidgetConfig();
        if (linked == null) {
            // 정책에 따라 404 또는 기본 설정 반환 결정
            throw new IllegalStateException("연결된 기본 위젯 설정이 없습니다. siteKey=" + siteKey);
        }
        if ("Y".equalsIgnoreCase(linked.getDelTf())) {
            throw new IllegalStateException("삭제된 위젯 설정입니다. id=" + linked.getId());
        }

        // 3) options 파싱 및 응답 매핑 (관리 응답 포맷 재사용)
        Map<String, Object> options = readOptions(linked.getOptionsJson());
        WidgetConfigResponse response = WidgetConfigResponse.from(linked, options);

        return response;

    }

    // 단건 조회
    @Transactional(readOnly = true)
    public WidgetConfigResponse get(Long id) {
        WidgetConfig e = widgetConfigRepository.findActiveById(id).orElseThrow();
        return WidgetConfigResponse.from(e, readOptions(e.getOptionsJson()));
    }

    // 위젯 관리 리스트 (페이징 + 키워드 필터)
    @Transactional(readOnly = true)
    public WidgetConfigListResponse list(String keyword, int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<WidgetConfig> result = widgetConfigRepository.search(normalize(keyword), pageable);

        List<WidgetConfigResponse> items = result.getContent().stream()
                .map(e -> WidgetConfigResponse.from(e, null)) // options 는 상세 조회 시 디코딩 (리스트는 경량)
                .toList();

        return WidgetConfigListResponse.of(items, result.getTotalElements(), result.getTotalPages());
    }

    // 위젯 관리 등록
    @Transactional
    public Long create(WidgetConfigRequest req, MultipartFile iconFile, String actor) {
        // 0) 첨부파일 처리
        Path basePath = fileUtil.resolveContactPath("widget");

        String savedPath = null;
        // String originalFileName = null; -> 원본 파일명이 필요할때,

        if (iconFile != null && !iconFile.isEmpty()) {
            // originalFileName = iconFile.getOriginalFilename(); //  오리지널 파일명 저장
            savedPath = fileUtil.saveFile(basePath, iconFile); //  /files/contact/uuid.ext
        }

        // 1) 이름 중복 방지(소프트삭제 제외)
        if (widgetConfigRepository.existsByNameAndDelTf(req.getName(), "N"))
            throw new IllegalArgumentException("이미 존재하는 이름입니다: " + req.getName());

        // 2) 위젯 엔티티 저장
        WidgetConfig e = new WidgetConfig();
        apply(e, req);
        e.setBubbleIconUrl(savedPath);
        e.setRegAdm(actor);
        widgetConfigRepository.save(e); // e.getId() 확보

        // 3) 선택: 사이트키와 매핑 (linkedSiteKeyId가 있을 때만)
        if (req.getLinkedSiteKeyId() != null) {
            SiteKey sk = siteKeyRepository.findByIdForUpdate(req.getLinkedSiteKeyId())
                    .orElseThrow(() -> new IllegalArgumentException("사이트키가 존재하지 않습니다. id=" + req.getLinkedSiteKeyId()));

            // 여기서 매핑: site_key.default_widget_config_id = 위젯 id
            sk.setDefaultWidgetConfig(e);
            sk.setUpAdm(actor);
            siteKeyRepository.save(sk);
        }

        return e.getId();
    }

    // 위젯 관리 업데이트
    public Long update(Long id, WidgetConfigRequest req, MultipartFile iconFile, String actor) {

        WidgetConfig e = widgetConfigRepository.findActiveById(id)
                .orElseThrow(() -> new IllegalArgumentException("위젯을 찾을 수 없습니다. id=" + id));

        // 이름 변경 시 중복 체크
        if (!e.getName().equals(req.getName()) && widgetConfigRepository.existsByNameAndDelTf(req.getName(), "N"))
            throw new IllegalArgumentException("이미 존재하는 이름입니다: " + req.getName());

        // 기존 아이콘 경로 보관
        String oldIconUrl = e.getBubbleIconUrl();

        apply(e, req);

        String finalIconUrl = e.getBubbleIconUrl(); // apply에서 들어간 값(요청값) 기준
        boolean replacedByNewFile = false;

        if (iconFile != null && !iconFile.isEmpty()) {
            Path basePath = fileUtil.resolveContactPath("widget"); // 예: /upload/widget
            String savedPath = fileUtil.saveFile(basePath, iconFile); // 예: /files/widget/uuid.ext
            finalIconUrl = savedPath;
            replacedByNewFile = true;
        } else {
            // 파일이 없을 때의 분기
            if (req.getBubbleIconUrl() != null && req.getBubbleIconUrl().isEmpty()) {
                // 빈 문자열이면 제거
                finalIconUrl = null;
            } else if (req.getBubbleIconUrl() == null) {
                // 미전달(null)이면 기존 유지
                finalIconUrl = oldIconUrl;
            }
        }
        e.setBubbleIconUrl(finalIconUrl);
        e.setUpAdm(actor);

        // 사이트키 매핑: linkedSiteKeyId가 넘어오면 해당 SiteKey에 이 위젯을 기본으로 설정
        if (req.getLinkedSiteKeyId() != null) {
            SiteKey sk = siteKeyRepository.findByIdForUpdate(req.getLinkedSiteKeyId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "사이트키가 존재하지 않습니다. id=" + req.getLinkedSiteKeyId()));

            // 상태/삭제여부 등 추가 검증이 필요하면 여기서 체크 지금은 생략 ㅎ
            // if (!"ACTIVE".equals(sk.getStatus()) || "Y".equals(sk.getDelTf())) { ... }

            sk.setDefaultWidgetConfig(e);
            sk.setUpAdm(actor);
            // save 호출은 생략 가능(JPA flush 시 반영)
            siteKeyRepository.save(sk);
        }

        // 새 파일로 교체되었으면, 이전 파일 삭제 시도 (서버 소유 경로만)
        if (replacedByNewFile
                && oldIconUrl != null && !oldIconUrl.isBlank()
                && !oldIconUrl.equals(finalIconUrl)
                && oldIconUrl.startsWith("/files/")) {
            try {
                java.nio.file.Files.deleteIfExists(fileUtil.resolveAbsolutePath(oldIconUrl));
            } catch (Exception ex) {
                // 실패해도 흐름 막지 않음 (로그만)
                // log.warn("이전 아이콘 삭제 실패: {}", oldIconUrl, ex);
            }
        }

        return e.getId();
    }

    /** 사용 여부 토글 (use_tf) */
    public Long toggleUse(Long id, String actor) {
        WidgetConfig e = widgetConfigRepository.findById(id).orElseThrow();
        e.setUseTf("Y".equals(e.getUseTf()) ? "N" : "Y");
        e.setUpAdm(actor);
        return e.getId();
    }

    /** 소프트 삭제 (del_tf='Y') */
    public Long logicalDelete(Long id, String actor) {
        WidgetConfig e = widgetConfigRepository.findById(id).orElseThrow();
        e.setDelTf("Y");
        e.setDelAdm(actor);
        return e.getId();
    }

    // ---------------------------
    // 내부 헬퍼
    // ---------------------------
    private void apply(WidgetConfig e, WidgetConfigRequest r) {
        // 기본 정보
        e.setName(trim(r.getName()));
        e.setPanelTitle(trim(r.getPanelTitle()));
        e.setWelcomeText(trim(r.getWelcomeText()));
        e.setInputPlaceholder(trim(r.getInputPlaceholder()));
        e.setSendButtonLabel(trim(r.getSendButtonLabel()));
        e.setLanguage(trim(r.getLanguage()));

        // 배치/크기
        e.setPosition(mapPosition(r.getPosition()));
        e.setOffsetX(r.getOffsetX());
        e.setOffsetY(r.getOffsetY());
        e.setPanelWidthPx(r.getPanelWidthPx());
        e.setPanelMaxHeightPx(r.getPanelMaxHeightPx());
        e.setZIndex(r.getZIndex());

        // 컬러
        e.setBubbleBgColor(trim(r.getBubbleBgColor()));
        e.setBubbleFgColor(trim(r.getBubbleFgColor()));
        e.setPanelBgColor(trim(r.getPanelBgColor()));
        e.setPanelTextColor(trim(r.getPanelTextColor()));
        e.setHeaderBgColor(trim(r.getHeaderBgColor()));
        e.setHeaderBorderColor(trim(r.getHeaderBorderColor()));
        e.setInputBgColor(trim(r.getInputBgColor()));
        e.setInputTextColor(trim(r.getInputTextColor()));
        e.setPrimaryColor(trim(r.getPrimaryColor()));

        // 아이콘/로고
        e.setBubbleIconEmoji(trim(r.getBubbleIconEmoji()));
//        e.setBubbleIconUrl(trim(r.getBubbleIconUrl()));
//        e.setLogoUrl(trim(r.getLogoUrl()));

        // 동작
        e.setOpenOnLoad(flag(r.getOpenOnLoad()));
        e.setOpenDelayMs(r.getOpenDelayMs());
        e.setGreetOncePerOpen(flag(r.getGreetOncePerOpen()));
        e.setCloseOnEsc(flag(r.getCloseOnEsc()));
        e.setCloseOnOutsideClick(flag(r.getCloseOnOutsideClick()));

        // 확장 옵션(JSON)
        e.setOptionsJson(writeOptions(r.getOptions()));

        // 메모
        e.setNotes(trim(r.getNotes()));
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

    private String trim(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String normalize(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
    private String flag(String s) { return ("Y".equalsIgnoreCase(s)) ? "Y" : "N"; }

    private WidgetConfig.Position mapPosition(WidgetConfigRequest.Position p) {
        if (p == null) return WidgetConfig.Position.right;
        return switch (p) {
            case right -> WidgetConfig.Position.right;
            case left  -> WidgetConfig.Position.left;
        };
    }

    private String writeOptions(Map<String, Object> opt) {
        if (opt == null || opt.isEmpty()) return null;
        try { return om.writeValueAsString(opt); }
        catch (Exception e) { throw new RuntimeException("options 직렬화 실패", e); }
    }

    private Map<String, Object> readOptions(String json) {
        if (json == null || json.isBlank()) return null;
        try { return om.readValue(json, new TypeReference<>() {}); }
        catch (Exception e) { throw new RuntimeException("options 파싱 실패", e); }
    }


}
