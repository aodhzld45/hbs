package com.hbs.hsbbo.admin.ai.promptprofile.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.request.PromptProfileRequest;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileListResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.repository.PromptProfileRepository;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.repository.SiteKeyRepository;
import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import com.hbs.hsbbo.common.exception.CommonException.NotFoundException;
import com.hbs.hsbbo.common.util.FileUtil;
import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatWithPromptProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PromptProfileService {

    private final PromptProfileRepository promptProfileRepository;
    private final SiteKeyService siteKeyService;
    private final SiteKeyRepository siteKeyRepository;
    private final FileUtil fileUtil;
    private final ObjectMapper om;

    @Transactional(readOnly = true)
    public PromptProfileResponse loadForPublic(String siteKey, String host) {
        if (siteKey == null || siteKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "siteKey is required");
        }

        PromptProfile entity = findDefaultProfileForSiteKeyOrThrow(siteKey, host);

        // (선택) 공용 노출 조건 여기서 한번 더 가드
        // if ("Y".equals(entity.getDelTf()) || "N".equals(entity.getUseTf())) { ... }

        return PromptProfileResponse.from(entity);
    }

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
        PromptProfile e = promptProfileRepository.findActiveById(id)
                .orElseThrow(() -> new NotFoundException("프롬프트 프로필을 찾을 수 없습니다. id=%d", id));
        return PromptProfileResponse.from(e);
    }

    // 등록(create)
    public Long create(PromptProfileRequest request, List<MultipartFile> files, String actor) {

        // 0) 첨부파일 처리
        Map<String, String> saved = new HashMap<>();
        Path basePath = fileUtil.resolveContactPath("promptProfile");

        String savedPath = null;

        if (files != null) {
            for (MultipartFile f : files) {
                if(f == null || f.isEmpty()) continue;
                String key = fileUtil.extractFileKey(f.getOriginalFilename());
                savedPath = fileUtil.saveFile(basePath, f);
                saved.put(key, savedPath);
            }
        }

        // welcomeBlockJson 치환
        String welcomeJson = request.getWelcomeBlocksJson();
        String patched = patchWelcomeBlocksJson(welcomeJson, saved);

        request.setWelcomeBlocksJson(patched);

        String name = normalizeName(request.getName());

        // 1) 이름 중복 체크
        if(promptProfileRepository.existsByNameAndDelTf(name, "N"))
            throw new IllegalArgumentException("이미 존재하는 이름입니다: " + request.getName());
        // 2) 프롬프트 프로필 엔티티 저장
        PromptProfile e = new PromptProfile();
        applyFromRequest(e, request, true);
        e.setRegAdm(actor);
        promptProfileRepository.save(e); // e.getId() 확보

        // 3) 사이트키와 매핑 (linkedSiteKeyId가 있을 때만)
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
    public Long update(Long id, PromptProfileRequest request, List<MultipartFile> files, String actor) {

        PromptProfile e = promptProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로필입니다. id=" + id));

        // 0) 첨부파일 처리
        Map<String, String> saved = new HashMap<>();
        Path basePath = fileUtil.resolveContactPath("promptProfile");

        String savedPath = null;

        if (files != null) {
            for (MultipartFile f : files) {
                if (f == null || f.isEmpty()) continue;
                String key = fileUtil.extractFileKey(f.getOriginalFilename());
                savedPath = fileUtil.saveFile(basePath, f);
                saved.put(key, savedPath);
            }
        }

        // 1) welcomeBlocksJson 치환 (files 있을 때만 의미 있음)
        if (!saved.isEmpty()) {
            String welcomeJson = request.getWelcomeBlocksJson();
            String patched = patchWelcomeBlocksJson(welcomeJson, saved);
            request.setWelcomeBlocksJson(patched);
        }

        // 2) 이름 중복 체크 (create와 동일 룰)
        String newName = normalizeName(request.getName());
        String currentName = normalizeName(e.getName());

        if (!newName.equals(currentName)) {
            boolean exists = promptProfileRepository.existsByNameAndDelTf(newName, "N");
            if (exists) {
                throw new IllegalArgumentException("이미 존재하는 이름입니다: " + request.getName());
            }
        }

        // 3) 엔티티 반영
        applyFromRequest(e, request, false);
        e.setUpAdm(actor);
        promptProfileRepository.save(e); // e.getId() 확보

        // 4) 사이트키 매핑: linkedSiteKeyId가 넘어오면 해당 SiteKey에 이 프롬프트 프로필을 기본으로 설정
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

    // 사용 여부 토글 (use_tf)
    public Long toggleUse(Long id, String actor) {
        PromptProfile e = promptProfileRepository.findById(id).orElseThrow();
        if ("Y".equals(e.getDelTf())) {
            throw new IllegalStateException("이미 삭제된 프로필은 사용 여부를 변경할 수 없습니다.");
        }
        e.setUseTf("Y".equals(e.getUseTf()) ? "N" : "Y");
        e.setUpAdm(actor);
        return e.getId();
    }

    // 소프트 삭제 (del_tf='Y')
    public Long logicalDelete(Long id, String actor) {
        PromptProfile e = promptProfileRepository.findById(id).orElseThrow();
        if ("Y".equals(e.getDelTf())) {
            return e.getId(); // 이미 삭제된 경우 조용히 반환
        }
        e.setDelTf("Y");
        e.setDelAdm(actor);
        return e.getId();
    }
    // 사이트키 검증 프로필 반환
    @Transactional(readOnly = true)
    public PromptProfile findDefaultProfileForSiteKeyOrThrow(String siteKey, String host) {
        if (siteKey == null || siteKey.isBlank()) {
            throw new IllegalArgumentException("사이트키가 비어 있습니다.");
        }

        // 도메인/상태 검증
        SiteKey sk = siteKeyRepository.findBySiteKey(siteKey)
                .orElseThrow(() -> new IllegalArgumentException("사이트키를 찾을 수 없습니다."));

        if (!sk.isActive()) {
            throw new IllegalStateException("비활성화된 사이트키 입니다. siteKey=" + siteKey);
        }
        if (host != null && !sk.isDomainAllowed(host)) {
            throw new IllegalStateException("허용되지 않은 도메인입니다. host=" + host);
        }

        PromptProfile profile = sk.getDefaultPromptProfileId(); // 연관관계 전제
        if (profile == null) {
            throw new IllegalStateException("연결된 기본 프롬프트 프로필이 없습니다. siteKey=" + siteKey);
        }
        // 필요하면 status/useTf/delTf 검사
        return profile;
    }

    // 실제 운영 OpenAPI Chat PromptProfile → ChatWithPromptProfileRequest 조립
    public ChatWithPromptProfileRequest buildChatWithProfileRequest(
            PromptProfile promptProfile,
            ChatRequest userReq
    ) {
        if (userReq.getPrompt() == null || userReq.getPrompt().isBlank()) {
            throw new IllegalArgumentException("사용자 질문 프롬프트는 필수 값 입니다");
        }

        return ChatWithPromptProfileRequest.builder()
                // 메타
                .promptProfileId(promptProfile.getId())
                .promptProfileName(promptProfile.getName())
                .promptProfileVersion(promptProfile.getVersion())
                .tenantId(promptProfile.getTenantId())
                .purpose(promptProfile.getPurpose())

                // 유저 입력
                .userPrompt(userReq.getPrompt())
                .context(userReq.getContext())

                // 모델/파라미터 (엔티티 기준)
                .model(promptProfile.getModel())
                .temperature(promptProfile.getTemperature())
                .topP(promptProfile.getTopP())
                .maxTokens(promptProfile.getMaxTokens())
                .seed(promptProfile.getSeed())
                .freqPenalty(promptProfile.getFreqPenalty())
                .presencePenalty(promptProfile.getPresencePenalty())

                // 프롬프트 리소스
                .systemTpl(promptProfile.getSystemTpl())
                .guardrailTpl(promptProfile.getGuardrailTpl())
                .styleJson(promptProfile.getStyleJson())
                .policiesJson(promptProfile.getPoliciesJson())

                // JSON → List 조립
                .stop(parseStopJson(promptProfile.getStopJson()))
                .tools(parseToolsJson(promptProfile.getToolsJson()))
                .build();
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
        e.setName(normalizeName(dto.getName()));
        e.setPurpose(dto.getPurpose());

        // 모델/파라미터
        e.setModel(dto.getModel());
        e.setTemperature(dto.getTemperature());
        e.setTopP(dto.getTopP());
        e.setMaxTokens(dto.getMaxTokens());
        e.setSeed(dto.getSeed());
        e.setFreqPenalty(dto.getFreqPenalty());
        e.setPresencePenalty(dto.getPresencePenalty());

        // 프롬프트 리소스
        e.setSystemTpl(dto.getSystemTpl());
        e.setGuardrailTpl(dto.getGuardrailTpl());

        // JSON 컬럼들
        // create: 항상 반영(빈 문자열이면 null)
        // update: 전달된 경우(dto 필드가 null이 아닌 경우)에만 반영, 빈 문자열이면 null로 초기화
        if (isCreate) {
            e.setWelcomeBlocksJson(writeOptions(dto.getWelcomeBlocksJson()));
            e.setStyleJson(writeOptions(dto.getStyleJson()));
            e.setToolsJson(writeOptions(dto.getToolsJson()));
            e.setPoliciesJson(writeOptions(dto.getPoliciesJson()));
            e.setStopJson(writeOptions(dto.getStopJson()));
        } else {
            if (dto.getWelcomeBlocksJson() != null) {
                e.setWelcomeBlocksJson(writeOptions(dto.getWelcomeBlocksJson()));
            }
            if (dto.getStyleJson() != null) {
                e.setStyleJson(writeOptions(dto.getStyleJson()));
            }
            if (dto.getToolsJson() != null) {
                e.setToolsJson(writeOptions(dto.getToolsJson()));
            }
            if (dto.getPoliciesJson() != null) {
                e.setPoliciesJson(writeOptions(dto.getPoliciesJson()));
            }
            if (dto.getStopJson() != null) {
                e.setStopJson(writeOptions(dto.getStopJson()));
            }
        }

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
    private String normalizeName(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        String trimmed = s.trim();
        return trimmed.toLowerCase(Locale.ROOT);
    }

    private String normalize(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private String writeOptions(String json) {
        if (json == null) return null;
        String trimmed = json.trim();
        return trimmed.isEmpty() ? null : trimmed;  // "" → null
    }

    /** stop_json → List<String> */
    public List<String> parseStopJson(String stopJson) {
        if (stopJson == null || stopJson.isBlank()) return null;
        try {
            return om.readValue(stopJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new RuntimeException("stop_json 파싱 실패", e);
        }
    }

    /** tools_json → List<Map<String,Object>> */
    public List<Map<String,Object>> parseToolsJson(String toolsJson) {
        if (toolsJson == null || toolsJson.isBlank()) return null;
        try {
            return om.readValue(toolsJson, new TypeReference<List<Map<String,Object>>>() {});
        } catch (Exception e) {
            throw new RuntimeException("tools_json 파싱 실패", e);
        }
    }

    // welcomeBlocksJson imageRef Path 치환
    private String patchWelcomeBlocksJson(String welcomeJson, Map<String, String> saved) {
        if (welcomeJson == null || welcomeJson.isBlank()) return welcomeJson;
        if (saved == null || saved.isEmpty()) return welcomeJson;

        try {
            JsonNode root = om.readTree(welcomeJson);
            patchNodeRecursive(root, saved);
            return om.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalArgumentException("welcomeBlocksJson JSON 파싱/치환 실패", e);
        }
    }

    private void patchNodeRecursive(JsonNode node, Map<String, String> saved) {
        if (node == null) return;

        if (node.isObject()) {
            ObjectNode obj = (ObjectNode) node;

            // 1) imageRef: "file:key" 치환
            JsonNode imageRef = obj.get("imageRef");
            if (imageRef != null && imageRef.isTextual()) {
                String ref = imageRef.asText("").trim();
                if (ref.startsWith("file:")) {
                    String key = ref.substring("file:".length()).trim();
                    String path = saved.get(key);
                    if (path != null && !path.isBlank()) {
                        // imagePath overwrite or set
                        obj.put("imagePath", path);
                        // imageRef 제거
                        obj.remove("imageRef");
                    }
                }
            }

            // 2) (옵션) imagePath 자체가 "file:key" 로 들어오는 경우도 지원
            JsonNode imagePath = obj.get("imagePath");
            if (imagePath != null && imagePath.isTextual()) {
                String v = imagePath.asText("").trim();
                if (v.startsWith("file:")) {
                    String key = v.substring("file:".length()).trim();
                    String path = saved.get(key);
                    if (path != null && !path.isBlank()) {
                        obj.put("imagePath", path);
                    }
                }
            }

            // 3) 재귀 탐색 (모든 필드)
            Iterator<Map.Entry<String, JsonNode>> it = obj.fields();
            while (it.hasNext()) {
                Map.Entry<String, JsonNode> entry = it.next();
                patchNodeRecursive(entry.getValue(), saved);
            }
            return;
        }

        if (node.isArray()) {
            ArrayNode arr = (ArrayNode) node;
            for (int i = 0; i < arr.size(); i++) {
                patchNodeRecursive(arr.get(i), saved);
            }
        }
    }

    private String flag(String s) { return ("Y".equalsIgnoreCase(s)) ? "Y" : "N"; }

}
