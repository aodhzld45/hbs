package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.Comment;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class CommentResponse {
    private Long id;
    private String targetType;
    private Long targetId;
    private Long parentId;
    private String writerName;
    private String content;
    private String useTf;
    private String delTf;
    private LocalDateTime regDate;
    private LocalDateTime upDate;
    private LocalDateTime delDate;

    public static CommentResponse from(Comment entity) {
        CommentResponse response = new CommentResponse();
        response.setId(entity.getId());
        response.setTargetType(entity.getTargetType());
        response.setTargetId(entity.getTargetId());
        response.setParentId(entity.getParentId());
        response.setWriterName(entity.getWriterName());
        response.setContent(entity.getContent());
        response.setUseTf(entity.getUseTf());
        response.setDelTf(entity.getDelTf());
        response.setRegDate(entity.getRegDate());
        response.setUpDate(entity.getUpDate());
        response.setDelDate(entity.getDelDate());
        return response;
    }

}
