package com.hbs.hsbbo.admin.ai.kb.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Getter
@Setter
@Slf4j
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "kb_source")
public class KbSource extends AuditBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SiteKey FK
    @Column(name = "site_key_id", nullable = false)
    private Long siteKeyId;

    @Column(name = "vector_store_id", length = 100)
    private String vectorStoreId;

    @Column(name = "source_name", nullable = false, length = 100)
    private String sourceName;

    @Column(name = "description", length = 255)
    private String description;

}
