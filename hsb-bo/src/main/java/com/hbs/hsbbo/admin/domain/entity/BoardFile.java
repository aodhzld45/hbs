package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "board_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 게시글 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "file_extension")
    private String fileExtension;

    @Column(name = "disp_seq")
    private Integer dispSeq = 1;

    @Column(name = "use_tf")
    private String useTf = "Y";

    @Column(name = "del_tf")
    private String delTf = "N";

    @Column(name = "reg_adm")
    private String regAdm;

    @Column(name = "reg_date")
    private LocalDateTime regDate = LocalDateTime.now();

    @Column(name = "up_adm")
    private String upAdm;

    @Column(name = "up_date")
    private LocalDateTime upDate;

    @Column(name = "del_adm")
    private String delAdm;

    @Column(name = "del_date")
    private LocalDateTime delDate;
}

