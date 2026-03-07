package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "board_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class BoardConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_code", nullable = false, length = 50)
    private String boardCode;

    @Column(name = "board_name", nullable = false, length = 100)
    private String boardName;

    @Column(name = "board_desc", length = 500)
    private String boardDesc;

    @Column(name = "menu_path", length = 255)
    private String menuPath;

    @Column(name = "skin_type", nullable = false, length = 30)
    private String skinType = "LIST";

    @Column(name = "list_size", nullable = false)
    private Integer listSize = 10;

    @Column(name = "sort_seq", nullable = false)
    private Integer sortSeq = 0;

    @Column(name = "comment_tf", nullable = false, length = 1)
    private String commentTf = "Y";

    @Column(name = "file_tf", nullable = false, length = 1)
    private String fileTf = "Y";

    @Column(name = "notice_tf", nullable = false, length = 1)
    private String noticeTf = "N";

    @Column(name = "thumbnail_tf", nullable = false, length = 1)
    private String thumbnailTf = "N";

    @Column(name = "period_tf", nullable = false, length = 1)
    private String periodTf = "N";

    @Column(name = "secret_tf", nullable = false, length = 1)
    private String secretTf = "N";

    @Column(name = "reply_tf", nullable = false, length = 1)
    private String replyTf = "N";

    @Column(name = "category_tf", nullable = false, length = 1)
    private String categoryTf = "N";

    @Column(name = "category_mode", nullable = false, length = 20)
    private String categoryMode = "NONE";

    @Column(name = "category_json", columnDefinition = "LONGTEXT")
    private String categoryJson;

    @Column(name = "editor_tf", nullable = false, length = 1)
    private String editorTf = "Y";

    @Column(name = "read_role", length = 100)
    private String readRole;

    @Column(name = "write_role", length = 100)
    private String writeRole;

    @Column(name = "update_role", length = 100)
    private String updateRole;

    @Column(name = "delete_role", length = 100)
    private String deleteRole;

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
}
