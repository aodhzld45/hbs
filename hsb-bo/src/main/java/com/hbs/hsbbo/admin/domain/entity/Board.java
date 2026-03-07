package com.hbs.hsbbo.admin.domain.entity;

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
@ToString(exclude = {"boardConfig", "files"})
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_config_id", nullable = false)
    private BoardConfig boardConfig;

    @Column(name = "category_code", length = 50)
    private String categoryCode;

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

    @Column(name = "notice_tf", length = 1, nullable = false)
    private String noticeTf = "N";

    @Column(name = "notice_seq", nullable = false)
    private int noticeSeq = 0;

    @Column(name = "notice_start")
    private LocalDateTime noticeStart;

    @Column(name = "notice_end")
    private LocalDateTime noticeEnd;

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

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardFile> files = new ArrayList<>();
}
