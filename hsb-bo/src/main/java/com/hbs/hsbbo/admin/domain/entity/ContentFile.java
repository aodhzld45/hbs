package com.hbs.hsbbo.admin.domain.entity;

import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@Table(name = "contentfile")
public class ContentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Enumerated(EnumType.STRING)
    private ContentType contentType;

    private String title;
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String fileUrl;
    private String thumbnailUrl;
    private String extension;
    private Integer dispSeq;

    private char useTF = 'Y';
    private char delTF = 'N';

    private Long regAdm;
    private LocalDateTime regDate;

    private Long modifyAdm;
    private LocalDateTime modifyDate;

    private Long delAdm;
    private LocalDateTime delDate;

    // 최초 저장 시 regDate 설정
    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now();
    }

    //수정 시 modifyDate 설정
    @PreUpdate
    protected void onUpdate() {
        this.modifyDate = LocalDateTime.now();
    }
}
