package com.hbs.hsbbo.admin.dto.response;


import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class ContentFileResponse {

    private Long fileId;
    private String title;
    private String description;
    private String content;
    private String fileUrl;
    private String thumbnailUrl;
    private String extension;
    private Integer viewCount;
    private String fileType;
    private String contentType;
    private LocalDateTime regDate;


    public static ContentFileResponse fromEntity(ContentFile entity) {
        return new ContentFileResponse(
                entity.getFileId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getContent(),
                entity.getFileUrl(),
                entity.getThumbnailUrl(),
                entity.getExtension(),
                entity.getViewCount(),
                entity.getFileType().name(),
                entity.getContentType().name(),
                entity.getRegDate()
        );

    }
}
