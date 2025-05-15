package com.hbs.hsbbo.admin.domain.entity;

import com.hbs.hsbbo.admin.domain.type.BoardType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "board_type", nullable = false, length = 50)
    private BoardType boardType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "writer_name", length = 100)
    private String writerName;

    @Column(name = "image_path", length = 255)
    private String imagePath;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "use_tf", length = 1)
    private String useTf = "Y";

    @Column(name = "del_tf", length = 1)
    private String delTf = "N";

    @Column(name = "reg_adm", length = 100)
    private String regAdm;

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate = LocalDateTime.now();

    @Column(name = "up_adm", length = 100)
    private String upAdm;

    @Column(name = "up_date")
    private LocalDateTime upDate;

    @Column(name = "del_adm", length = 100)
    private String delAdm;

    @Column(name = "del_date")
    private LocalDateTime delDate;

    // 게시판 첨부파일 연관관계
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardFile> files = new ArrayList<>();
}
