package com.hbs.hsbbo.admin.domain.entity.page;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "page")
@Getter
@Setter
@NoArgsConstructor
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String url;

    @Column(name = "use_tf")
    private String useTf = "Y";

    @Column(name = "del_tf")
    private String delTf = "N";

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

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderSeq ASC")
    private List<PageSection> sections = new ArrayList<>();
}
