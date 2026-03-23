package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
    private String componentKey;
    private Integer orderSequence;
    private String description;
    private String useTf;
    private String delTf;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminMenuResponse fromEntity(AdminMenu entity) {
        return new AdminMenuResponse(
                entity.getId(),
                entity.getName(),
                entity.getDepth(),
                entity.getParentId(),
                entity.getUrl(),
                entity.getComponentKey(),
                entity.getOrderSequence(),
                entity.getDescription(),
                entity.getUseTf(),
                entity.getDelTf(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
