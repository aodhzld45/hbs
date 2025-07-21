package com.hbs.hsbbo.admin.dto.response.page;

import com.hbs.hsbbo.admin.domain.entity.page.CustomPage;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse {
    private Long id;
    private String name;
    private String url;
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static PageResponse fromEntity(CustomPage entity) {
        PageResponse response = new PageResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setUrl(entity.getUrl());
        response.setUseTf(entity.getUseTf());
        response.setDelTf(entity.getDelTf());
        response.setRegAdm(entity.getRegAdm());
        response.setRegDate(entity.getRegDate());
        response.setUpAdm(entity.getUpAdm());
        response.setUpDate(entity.getUpDate());
        response.setDelAdm(entity.getDelAdm());
        response.setDelDate(entity.getDelDate());
        return response;
    }

}
