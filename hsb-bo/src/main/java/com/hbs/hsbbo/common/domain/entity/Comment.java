package com.hbs.hsbbo.common.domain.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "comment")
@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 댓글이 달리는 대상 타입 (예: BOARD, CONTENTFILE 등)
    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    // 대상의 ID (board.id, contentfile.fileId 등)
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    // 대댓글 처리용: 부모 댓글 ID (null이면 일반 댓글)
    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "writer_name", nullable = false, length = 100)
    private String writerName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "password", length = 255)
    private String password; // 암호화된 비밀번호 저장

    @Column(name = "use_tf", nullable = false, length = 1)
    private String useTf = "Y";

    @Column(name = "del_tf", nullable = false, length = 1)
    private String delTf = "N";

    @Column(name = "reg_date", nullable = false)
    private LocalDateTime regDate = LocalDateTime.now();

    @Column(name = "up_date", nullable = false)
    private LocalDateTime upDate = LocalDateTime.now();

    @Column(name = "del_date", nullable = false)
    private LocalDateTime delDate = LocalDateTime.now();
}
