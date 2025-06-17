package com.hbs.hsbbo.admin.dto.request;

import lombok.Data;

@Data
public class UserMenuRequest {
    private String name;
    private Integer depth;
    private Long parentId;
    private String url;
    private Integer orderSeq;
    private String description;
    private String useTf = "Y";
}
