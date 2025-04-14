package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin")
@Data
public class Admin {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "group_id")
    private Integer groupId;

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(length = 100)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String tel;

    @Column(length = 100)
    private String memo;

    @Column(name = "password_length")
    private Integer passwordLength;

    @Column(name = "access_fail_count")
    private Integer accessFailCount;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "logged_at")
    private LocalDateTime loggedAt;

    @Column(name = "password_updated_at")
    private LocalDateTime passwordUpdatedAt;
}
