package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
public class AdminMenuResponse {
    private Long id;
    private String name;
    private Byte depth;
    private Integer parentId;
    private String url;
    private Integer orderSequence;
    private String description;
    private String useTf;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminMenuResponse fromEntity(AdminMenu entity) {
        return new AdminMenuResponse(
                entity.getId(),
                entity.getName(),
                entity.getDepth(),
                entity.getParentId(),
                entity.getUrl(),
                entity.getOrderSequence(),
                entity.getDescription(),
                entity.getUseTf(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
