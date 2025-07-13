package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.AdminLog;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class AdminLogResponse {
    private Long id;
    private String adminId;
    private String action;
    private String detail;
    private String url;
    private String params;
    private String ip;
    private LocalDateTime logDate;
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static AdminLogResponse fromEntity(AdminLog entity) {
        return new  AdminLogResponse(
                entity.getId(),
                entity.getAdminId(),
                entity.getAction(),
                entity.getDetail(),
                entity.getUrl(),
                entity.getParams(),
                entity.getIp(),
                entity.getLogDate(),
                entity.getUseTf(),
                entity.getDelTf(),
                entity.getRegAdm(),
                entity.getRegDate(),
                entity.getUpAdm(),
                entity.getUpDate(),
                entity.getDelAdm(),
                entity.getDelDate()
        );
    }

}
