package com.hbs.hsbbo.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "아이디는 필수 입니다")
    private String id;

    @NotBlank(message = "비밀번호는 필수 입니다")
    private String password;

}
