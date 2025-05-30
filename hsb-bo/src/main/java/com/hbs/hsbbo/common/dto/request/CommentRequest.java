package com.hbs.hsbbo.common.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CommentRequest {
    private String targetType;
    private Long targetId;
    private Long parentId; // null 가능
    private String writerName;
    private String content;
    private String password;
}
