package com.hbs.hsbbo.common.service;

import com.hbs.hsbbo.common.domain.entity.Contact;
import com.hbs.hsbbo.common.dto.request.ContactReplyRequest;
import com.hbs.hsbbo.common.dto.request.ContactRequest;
import com.hbs.hsbbo.common.dto.response.ContactListResponse;
import com.hbs.hsbbo.common.dto.response.ContactResponse;
import com.hbs.hsbbo.common.mail.MailService;
import com.hbs.hsbbo.common.repository.ContactRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContactService {
    @Autowired
    private final ContactRepository contactRepository;

    // 공통 메일 서비스 관련 주입.
    @Autowired
    private final MailService mailService;

    @Autowired
    private final FileUtil fileUtil;

    // 문의 관리 리스트 (페이징 + 키워드 필터)
    public ContactListResponse getContactList(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<Contact> contactPage;
        if (keyword != null && !keyword.isBlank()) {
            contactPage = contactRepository.findByKeyword(keyword, pageable);
        } else {
            contactPage = contactRepository.findByDelTf("N", pageable);
        }

        List<ContactResponse> items = contactPage.getContent().stream()
                .map(ContactResponse::from)
                .toList();

        return new ContactListResponse(items, contactPage.getTotalElements(), contactPage.getTotalPages());
    }

    // 문의 관리 상세
    public ContactResponse getContactDetail(Long id) {
        Contact contact = contactRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("문의글이 존재하지 않거나 삭제되었습니다."));

        ContactResponse dto = ContactResponse.from(contact);

        return dto;
    }

    // 문의 등록
    public ContactResponse createContact(ContactRequest request, MultipartFile file) {

        // 첨부파일 처리
        Path basePath = fileUtil.resolveContactPath("contact");

        String savedPath = null;
        String originalFileName = null;

        if (file != null && !file.isEmpty()) {
            originalFileName = file.getOriginalFilename(); //  오리지널 파일명 저장
            savedPath = fileUtil.saveFile(basePath, file); //  /files/contact/uuid.ext
        }

        Contact contact = new Contact();
        contact.setCompanyName(request.getCompanyName());
        contact.setContactName(request.getContactName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setTitle(request.getTitle());
        contact.setMessage(request.getMessage());

        contact.setProjectType(request.getProjectType());
        contact.setReplyMethod(request.getReplyMethod());
        contact.setFilePath(savedPath);
        contact.setOriginalFileName(originalFileName);

        contact.setAgreeTf(request.getAgreeTf());

        Contact saved = contactRepository.save(contact);
        return ContactResponse.from(saved);
    }

    public void replyToContact(ContactReplyRequest request) {
        Contact contact = contactRepository.findByIdAndDelTf(request.getId(),"N")
                .orElseThrow(() -> new EntityNotFoundException("문의글이 존재하지 않습니다."));

        contact.setReplyContent(request.getReplyContent());
        contact.setReplyMethod(request.getReplyMethod());
        contact.setReplyTf("Y");
        contact.setReplyDate(LocalDateTime.now());

        contactRepository.save(contact);

        // 1. EMAIL의 경우에만 메일 발송.
        if ("EMAIL".equalsIgnoreCase(request.getReplyMethod())) {
            mailService.sendTemplateMail(
                    contact.getEmail(),
                    "[HBS] 문의하신 내용에 대한 답변입니다.",
                    "email/contact-reply", // templates/email/contact-reply.html 템플릿.
                    Map.of(
                            "companyName", contact.getCompanyName(),
                            "contactName", contact.getContactName(),
                            "title",contact.getTitle(),
                            "replyContent", contact.getReplyContent()
                    )
            );
        }

        // 2. SMS 문자 발송의 경우는 추가 예정.

    }


}
