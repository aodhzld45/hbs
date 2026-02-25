package com.hbs.hsbbo.admin.ai.kb.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import com.hbs.hsbbo.admin.ai.kb.repository.KbDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * BO가 "어떤 문서를 쓸지" 정한 뒤, kb_document를 조회해
 * index_summary·tags_json으로 지문을 조합한 문자열(knowledgeContext)을 만든다.
 * Brain은 이 문자열만 받아 system 프롬프트 앞에 붙인다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeContextService {

    private final KbDocumentRepository kbDocumentRepository;
    private final ObjectMapper objectMapper;

    private static final String DOC_SEPARATOR = "\n\n---\n\n";

    /**
     * 프로필에 설정된 KB 문서 ID 목록(JSON 문자열)으로 지문 문자열을 조합한다.
     *
     * @param kbDocumentIdsJson JSON 배열 문자열 예: "[1,2,3]", null/빈 문자열이면 ""
     * @return 조합된 knowledgeContext 문자열 (비어 있으면 "")
     */
    public String buildKnowledgeContext(String kbDocumentIdsJson) {
        if (kbDocumentIdsJson == null || kbDocumentIdsJson.isBlank()) {
            return "";
        }
        List<Long> ids = parseIdList(kbDocumentIdsJson);
        if (ids.isEmpty()) {
            return "";
        }
        return buildKnowledgeContext(ids);
    }

    /**
     * 문서 ID 목록으로 kb_document를 조회해 index_summary·tags_json 기반 지문 문자열을 조합한다.
     */
    public String buildKnowledgeContext(List<Long> documentIds) {
        if (documentIds == null || documentIds.isEmpty()) {
            return "";
        }
        List<KbDocument> docs = kbDocumentRepository.findByIdInAndDelTfAndUseTf(documentIds);
        if (docs.isEmpty()) {
            return "";
        }
        // ID 순서 유지: documentIds 순서대로 정렬
        var byId = docs.stream().collect(Collectors.toMap(KbDocument::getId, d -> d));
        List<String> parts = new ArrayList<>();
        for (Long id : documentIds) {
            KbDocument d = byId.get(id);
            if (d == null) continue;
            String summary = d.getIndexSummary() != null ? d.getIndexSummary().trim() : "";
            String tags = formatTags(d.getTagsJson());
            String title = d.getTitle() != null ? d.getTitle().trim() : "";
            StringBuilder block = new StringBuilder();
            if (!title.isEmpty()) {
                block.append("[").append(title).append("]\n");
            }
            if (!summary.isEmpty()) {
                block.append(summary);
            }
            if (!tags.isEmpty()) {
                if (block.length() > 0) block.append("\n");
                block.append("tags: ").append(tags);
            }
            if (block.length() > 0) {
                parts.add(block.toString());
            }
        }
        return String.join(DOC_SEPARATOR, parts);
    }

    private List<Long> parseIdList(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("kb_document_ids JSON 파싱 실패: {}", json, e);
            return List.of();
        }
    }

    private String formatTags(String tagsJson) {
        if (tagsJson == null || tagsJson.isBlank()) return "";
        try {
            Object v = objectMapper.readValue(tagsJson, Object.class);
            return v != null ? v.toString() : "";
        } catch (Exception e) {
            return tagsJson.trim();
        }
    }
}
