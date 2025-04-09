package com.hbs.hsbbo.content.dto.request;


/*
*  등록 요청용 DTO 클래스
*  FE에서 요청한 정보를 담을 그릇.
* */

import com.hbs.hsbbo.content.entity.ContentType;
import com.hbs.hsbbo.content.entity.FileType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContentFileRequest {
    private String title;
    private String description;
    private FileType fileType;
    private ContentType contentType;

}
