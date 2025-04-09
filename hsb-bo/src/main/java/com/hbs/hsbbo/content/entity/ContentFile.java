package com.hbs.hsbbo.content.entity;

// ContentFile
/*
* CREATE TABLE ContentFile (
  fileId INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fileType ENUM('VIDEO', 'IMAGE', 'DOCUMENT') NOT NULL COMMENT '파일 종류: 영상, 이미지, 문서',
  contentType ENUM('HBS', 'PROMO', 'MEDIA', 'CI_BI') NOT NULL COMMENT '소속 콘텐츠 유형',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  fileUrl VARCHAR(500) NOT NULL,
  thumbnailUrl VARCHAR(500),
  extension VARCHAR(10), -- 예: mp4, jpg, pdf 확장자
  dispSeq INT(11),
  useTF CHAR(1) NOT NULL DEFAULT 'Y',
  delTF CHAR(1) NOT NULL DEFAULT 'N',
  regAdm INT(11) UNSIGNED,
  regDate DATETIME,
  modifyAdm INT(11) UNSIGNED,
  modifyDate DATETIME,
  delAdm INT(11) UNSIGNED,
  delDate DATETIME
);
* */

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class ContentFile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId; // pk

    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Enumerated(EnumType.STRING)
    private ContentType contentType;

    private String title;

    private String description;

    private String fileUrl;

    private String thumbnailUrl;

    private String extension; //mp4, jpg, pdf 확장자

    private Integer dispSeq; // 순서 시퀀스

    private char useTF = 'Y'; // 사용여부
    private char delTF = 'N'; // 삭제여부

    private Long regAdm; // 등록 관리자 일련번호
    private LocalDateTime regDate; // 등록날짜

    private Long modifyAdm; // 수정 관리자 일련번호
    private LocalDateTime modifyDate; // 수정날짜

    private Long delAdm; // 삭제 관리자 일련번호
    private LocalDateTime delDate; // 삭제날짜

    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now(); // 등록시 현재날짜
    }

    @PrePersist
    protected void onUpdate() {
        this.modifyDate = LocalDateTime.now(); // 수정시 현재날짜
    }
}
