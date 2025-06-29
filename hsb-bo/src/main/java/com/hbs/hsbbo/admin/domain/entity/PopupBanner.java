package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "popup_banner")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupBanner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String type;


    @Column(name = "file_path")
    private String filePath;

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "order_seq")
    private Integer orderSeq;

    @Column(name = "use_tf")
    private String useTf;

    @Column(name = "del_tf")
    private String delTf;

    @Column(name = "reg_adm")
    private String regAdm;

    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Column(name = "up_adm")
    private String upAdm;

    @Column(name = "up_date")
    private LocalDateTime upDate;

    @Column(name = "del_adm")
    private String delAdm;

    @Column(name = "del_date")
    private LocalDateTime delDate;
}
