package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.repository.CodeGroupAdminRepository;
import com.hbs.hsbbo.common.domain.entity.CodeGroup;
import com.hbs.hsbbo.common.dto.request.CodeGroupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CodeGroupAdminService {

    private final CodeGroupAdminRepository codeGroupAdminRepository;

    @Transactional
    public void createGroup(CodeGroupRequest req, String adminId) {
        CodeGroup group = new CodeGroup();
        group.setCodeGroupId(req.getCodeGroupId());
        group.setGroupName(req.getGroupName());
        group.setDescription(req.getDescription());
        group.setOrderSeq(req.getOrderSeq());
        group.setUseTf(req.getUseTf());
        group.setDelTf("N");
        group.setRegAdm(adminId);
        group.setRegDate(LocalDateTime.now());

        codeGroupAdminRepository.save(group);
    }

    @Transactional
    public void updateGroup(String id, CodeGroupRequest req, String adminId) {
        CodeGroup group = codeGroupAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));
        group.setGroupName(req.getGroupName());
        group.setDescription(req.getDescription());
        group.setOrderSeq(req.getOrderSeq());
        group.setUseTf(req.getUseTf());
        group.setUpAdm(adminId);
        group.setUpDate(LocalDateTime.now());
        codeGroupAdminRepository.save(group);
    }

    @Transactional
    public void deleteGroup(String id, String adminId) {
        CodeGroup group = codeGroupAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));
        group.setDelTf("Y");
        group.setDelAdm(adminId);
        group.setDelDate(LocalDateTime.now());
        codeGroupAdminRepository.save(group);
    }
}

