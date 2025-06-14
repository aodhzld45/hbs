package com.hbs.hsbbo.common.controller;

import com.hbs.hsbbo.common.dto.request.ContactReplyRequest;
import com.hbs.hsbbo.common.dto.request.ContactRequest;
import com.hbs.hsbbo.common.dto.response.ContactListResponse;
import com.hbs.hsbbo.common.dto.response.ContactResponse;
import com.hbs.hsbbo.common.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<Map<String,Object>> getContactList(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        ContactListResponse result = contactService.getContactList(keyword, page, size);
        Map<String,Object> response = new HashMap<>();
        response.put("data", result);
        response.put("message", "문의 목록이 정상적으로 조회되었습니다.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail")
    public ResponseEntity<ContactResponse> getContactDetail(
            @RequestParam Long id
    ) {
        ContactResponse result = contactService.getContactDetail(id);

        return ResponseEntity.ok(result);
    }

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

    @PostMapping("/reply")
    public ResponseEntity<Map<String, Object>> replyToContact(@RequestBody ContactReplyRequest request) {
        contactService.replyToContact(request);

        String method = request.getReplyMethod();
        String message;

        if ("EMAIL".equalsIgnoreCase(method)) {
            message = "문의에 대한 답변이 저장되었으며, 해당 이메일로 회신되었습니다.";
        } else if ("SMS".equalsIgnoreCase(method)) {
            message = "문의에 대한 답변이 저장되었으며, 등록된 연락처로 문자(SMS)로 회신되었습니다.";
        } else {
            message = "문의에 대한 답변이 저장되었습니다.";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/delete/{id}")
    public ResponseEntity<?> deleteContact(@PathVariable Long id) {
        try {
            contactService.deleteContact(id);
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 실패");
        }
    }

}
