package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.UserMenu;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
public class UserMenuResponse {
    private Long id;
    private String name;
    private Integer depth;
    private Long parentId;
    private String url;
    private Integer orderSeq;
    private String description;
    private String useTf;
    private LocalDateTime regDate;
    private LocalDateTime upDate;

    public static UserMenuResponse fromEntity(UserMenu entity) {
        return new UserMenuResponse(
                entity.getId(),
                entity.getName(),
                entity.getDepth(),
                entity.getParentId(),
                entity.getUrl(),
                entity.getOrderSeq(),
                entity.getDescription(),
                entity.getUseTf(),
                entity.getRegDate(),
                entity.getUpDate()
        );
    }
}
