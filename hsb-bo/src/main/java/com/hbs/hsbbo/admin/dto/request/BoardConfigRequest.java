package com.hbs.hsbbo.admin.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class BoardConfigRequest {
    private String boardCode;
    private String boardName;
    private String boardDesc;
    private String menuPath;
    private String skinType;
    private Integer listSize;
    private Integer sortSeq;
    private String commentTf;
    private String fileTf;
    private String noticeTf;
    private String thumbnailTf;
    private String periodTf;
    private String secretTf;
    private String replyTf;
    private String categoryTf;
    private String categoryMode;
    private String categoryJson;
    private String editorTf;
    private String readRole;
    private String writeRole;
    private String updateRole;
    private String deleteRole;
    private String useTf;
}
