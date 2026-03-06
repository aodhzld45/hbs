package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.AppBlockIp;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class BlockIpResponse {

    private Long id;
    private String ipAddress;
    private String description;
    private String useTf;
    private String delTf;
    private LocalDateTime regDate;
    private LocalDateTime upDate;
    private LocalDateTime delDate;

    public static BlockIpResponse from(AppBlockIp e) {
        return BlockIpResponse.builder()
                .id(e.getId())
                .ipAddress(e.getIpAddress())
                .description(e.getDescription())
                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regDate(e.getRegDate())
                .upDate(e.getUpDate())
                .delDate(e.getDelDate())
                .build();
    }
}
