package com.hbs.hsbbo.common.dto.response;

import com.hbs.hsbbo.common.domain.entity.Contact;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {
    private Long id;
    private String companyName;
    private String contactName;
    private String email;
    private String phone;
    private String title;
    private String message;
    private String projectType;
    private String replyMethod;
    private String filePath;
    private String originalFileName;
    private String agreeTf;
    private String replyContent;
    private String replyTf;
    private String useTf;
    private String delTf;
    private LocalDateTime regDate;
    private LocalDateTime replyDate;

    public static ContactResponse from(Contact entity) {
        ContactResponse response = new ContactResponse();
        response.setId(entity.getId());
        response.setCompanyName(entity.getCompanyName());
        response.setContactName(entity.getContactName());
        response.setEmail(entity.getEmail());
        response.setPhone(entity.getPhone());
        response.setTitle(entity.getTitle());
        response.setMessage(entity.getMessage());
        response.setProjectType(entity.getProjectType());
        response.setReplyMethod(entity.getReplyMethod());
        response.setFilePath(entity.getFilePath());
        response.setOriginalFileName(entity.getOriginalFileName());
        response.setAgreeTf(entity.getAgreeTf());
        response.setReplyContent(entity.getReplyContent());
        response.setReplyTf(entity.getReplyTf());
        response.setUseTf(entity.getUseTf());
        response.setDelTf(entity.getDelTf());
        response.setRegDate(entity.getRegDate());
        response.setReplyDate(entity.getReplyDate());
        return response;
    }


}
