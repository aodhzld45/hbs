package com.hbs.hsbbo.admin.domain.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "admin_role_menu")
@Getter
@Setter
@ToString
public class AdminRoleMenu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private AdminRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id")
    private AdminMenu menu;

    @Column(name = "use_tf", length = 1)
    private String useTf;

    @Column(name = "del_tf", length = 1)
    private String delTf;

}