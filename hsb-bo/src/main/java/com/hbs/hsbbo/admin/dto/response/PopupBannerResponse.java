package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.PopupBanner;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor

public class PopupBannerResponse {

    private Long id;
    private String title;
    private String type;
    private String filePath;
    private String originalFileName;
    private String linkUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public static PopupBannerResponse from(PopupBanner entity) {
        PopupBannerResponse response = new PopupBannerResponse();
        response.setId(entity.getId());
        response.setTitle(entity.getTitle());
        response.setType(entity.getType());
        response.setFilePath(entity.getFilePath());
        response.setOriginalFileName(entity.getOriginalFileName());
        response.setLinkUrl(entity.getLinkUrl());
        response.setStartDate(entity.getStartDate());
        response.setEndDate(entity.getEndDate());
        return response;
    }
}
