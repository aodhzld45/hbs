package com.hbs.hsbbo.admin.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BoardRequest {
    private String boardType;
    private String title;
    private String content;
    private String writerName;
    private String useTf;
}
