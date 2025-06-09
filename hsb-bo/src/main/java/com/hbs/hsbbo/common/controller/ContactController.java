package com.hbs.hsbbo.common.controller;

import com.hbs.hsbbo.common.dto.request.ContactRequest;
import com.hbs.hsbbo.common.dto.response.ContactResponse;
import com.hbs.hsbbo.common.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private final ContactService contactService;
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createContact(
            @RequestPart("companyName") String companyName,
            @RequestPart("contactName") String contactName,
            @RequestPart("email") String email,
            @RequestPart("phone") String phone,
            @RequestPart("title") String title,
            @RequestPart("message") String message,
            @RequestPart(value = "projectType", required = false) String projectType,
            @RequestPart(value = "replyMethod", required = false) String replyMethod,
            @RequestPart(value = "agreeTf") String agreeTf,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        ContactRequest request = new ContactRequest();
            request.setCompanyName(companyName);
            request.setContactName(contactName);
            request.setEmail(email);
            request.setPhone(phone);
            request.setTitle(title);
            request.setMessage(message);
            request.setProjectType(projectType);
            request.setReplyMethod(replyMethod);
            request.setAgreeTf(agreeTf);

        ContactResponse result = contactService.createContact(request, file); // file도 넘김

        Map<String, Object> response = new HashMap<>();
        response.put("res", result);
        response.put("message", "문의가 등록되었습니다. 빠른 시일 내 답변드리겠습니다.");
        return ResponseEntity.ok(response);
    }

}
