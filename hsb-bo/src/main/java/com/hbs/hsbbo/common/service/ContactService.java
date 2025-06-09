package com.hbs.hsbbo.common.service;

import com.hbs.hsbbo.common.domain.entity.Contact;
import com.hbs.hsbbo.common.dto.request.ContactRequest;
import com.hbs.hsbbo.common.dto.response.ContactResponse;
import com.hbs.hsbbo.common.repository.ContactRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class ContactService {
    @Autowired
    private final ContactRepository contactRepository;

    @Autowired
    private final FileUtil fileUtil;

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

}
