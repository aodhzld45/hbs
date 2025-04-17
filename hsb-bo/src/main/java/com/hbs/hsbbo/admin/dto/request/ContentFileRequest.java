package com.hbs.hsbbo.admin.dto.request;


/*
*  등록 요청용 DTO 클래스
*  FE에서 요청한 정보를 담을 그릇.
* */

import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ContentFileRequest {
    private String title;
    private String description;
    private String content;
    private FileType fileType;
    private ContentType contentType;
    private String fileUrl;
    private String thumbnailUrl;

}
