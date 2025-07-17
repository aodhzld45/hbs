package com.hbs.hsbbo.admin.dto.response.page;

import com.hbs.hsbbo.admin.domain.entity.page.PageSection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PageSectionResponse {
    private Long id;

    private Long pageId;  // 엔티티 참조 대신 ID
    private String sectionName;
    private String layoutType;
    private String optionJson;
    private Integer orderSeq;
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static PageSectionResponse fromEntity(PageSection entity) {
        PageSectionResponse response = new PageSectionResponse();
        response.setId(entity.getId());
        response.setPageId(entity.getPage().getId());  // 연관된 페이지 ID
        response.setSectionName(entity.getSectionName());
        response.setLayoutType(entity.getLayoutType());
        response.setOptionJson(entity.getOptionJson());
        response.setOrderSeq(entity.getOrderSeq());
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
