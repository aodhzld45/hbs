package com.hbs.hsbbo.common.dto.request;

import lombok.*;
import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    private String contactName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private String projectType;    // 선택형
    private String replyMethod;    // EMAIL / SMS / BOTH
    private String filePath;       // 첨부파일 경로 (선택)

    @NotBlank
    private String agreeTf;        // 개인정보 수집 동의 (Y)
}
