package com.hbs.hsbbo.admin.ai.kb.dto.response;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Getter
@Setter
@Slf4j
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KbDocumentResponse {

    private Long id;
    private Long kbSourceId;
    private String title;
    private String docType;
    private String docStatus;
    private float version;
    private String filePath;
    private String originalFileName;
    private Long fileSize;
    private String fileHash;
    private String mimeType;
    private String sourceUrl;
    private String category;
    private String tagsJson;

    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static KbDocumentResponse from(KbDocument hd) {
        if (hd == null) return null;

        return KbDocumentResponse.builder()
                .id(hd.getId())
                .kbSourceId(hd.getKbSourceId())
                .title(hd.getTitle())
                .docType(hd.getDocType())
                .docStatus(hd.getDocStatus())
                .version(hd.getVersion())
                .filePath(hd.getFilePath())
                .originalFileName(hd.getOriginalFileName())
                .fileSize(hd.getFileSize())
                .fileHash(hd.getFileHash())
                .mimeType(hd.getMimeType())
                .sourceUrl(hd.getSourceUrl())
                .category(hd.getCategory())
                .tagsJson(hd.getTagsJson())
                .regAdm(hd.getRegAdm())
                .regDate(hd.getRegDate())
                .upAdm(hd.getUpAdm())
                .upDate(hd.getUpDate())
                .delAdm(hd.getDelAdm())
                .delDate(hd.getDelDate())
                .build();
    }
}
