package com.hbs.hsbbo.admin.ai.kb.dto.request;

import jakarta.validation.constraints.*;

public class KbDocumentRequest {
    @NotNull
    private Long kbSourceId;

    @NotBlank
    @Size(max = 200)
    private String title;

    /**
     * 예: PDF, DOCX, HTML, IMAGE, TEXT, URL
     */
    @NotBlank
    @Size(max = 30)
    private String docType;

    @Size(max = 30)
    private String docStatus;

    /**
     * 보통 생성 시 1로 시작, 파일 교체/재업로드 시 +1
     * - 클라이언트가 안 보내면 서버에서 기본값 처리 권장
     */
    private Integer version;

    /**
     * 단일 파일 정책:
     * - 업로드 후 서버가 세팅하는 값(권장)
     * - URL 문서라면 sourceUrl만 사용하고 filePath는 null
     */
    @Size(max = 500)
    private String filePath;

    @Size(max = 255)
    private String originalFileName;

    private Long fileSize;

    @Size(max = 64)
    private String fileHash;

    @Size(max = 100)
    private String mimeType;

    @Size(max = 1000)
    private String sourceUrl;

    @Size(max = 50)
    private String category;

    /**
     * JSON string (예: '["cookie","choco","allergy:egg"]')
     */
    private String tagsJson;
}
