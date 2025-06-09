package com.hbs.hsbbo.common.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CONTACT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(name = "contact_name", nullable = false, length = 50)
    private String contactName;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "project_type", length = 50)
    private String projectType;

    @Column(name = "reply_method", length = 20)
    private String replyMethod;

    @Column(name = "file_path", length = 255)
    private String filePath;

    @Column(name = "originalFileName", length = 255)
    private String originalFileName;

    @Column(name = "agree_tf", length = 1)
    private String agreeTf = "N";

    @Column(name = "reply_content", columnDefinition = "TEXT")
    private String replyContent;

    @Column(name = "reply_tf", length = 1)
    private String replyTf = "N";

    @Column(name = "use_tf", length = 1)
    private String useTf = "Y";

    @Column(name = "del_tf", length = 1)
    private String delTf = "N";

    @Column(name = "reg_date", updatable = false)
    private LocalDateTime regDate = LocalDateTime.now();

    @Column(name = "reply_date")
    private LocalDateTime replyDate;
}
