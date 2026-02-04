package com.hbs.hsbbo.admin.ai.kb.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "kb_document")
public class KbDocument extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kb_source_id", nullable = false)
    private Long kbSourceId;

    @Column(name = "vector_store_id")
    private String vectorStoreId;

    @Column(name = "vector_file_id")
    private String vectorFileId;

    @Column(name = "indexed_at")
    private LocalDateTime indexedAt;

    @Column(name = "index_error")
    private String indexError;

    @Column(name = "index_summary", columnDefinition = "LONGTEXT")
    private String indexSummary;

    private String title;

    @Column(name = "doc_type", nullable = false)
    private String docType;

    @Column(name = "doc_status", nullable = false)
    private String docStatus;

    private int version;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_hash")
    private String fileHash;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "source_url")
    private String sourceUrl;

    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags_json")
    private String tagsJson;

}
