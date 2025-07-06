package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.repository.CodeDetailAdminRepository;
import com.hbs.hsbbo.admin.repository.CodeGroupAdminRepository;
import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import com.hbs.hsbbo.common.domain.entity.CodeGroup;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodeDetailAdminService {

    private final CodeDetailAdminRepository codeDetailAdminRepository;
    private final CodeGroupAdminRepository codeGroupAdminRepository;

    public List<CodeDetailResponse> getAllDetails(Long groupId) {
        List<CodeDetail> entities = codeDetailAdminRepository.findAllByCodeGroupIdAndDelTfOrderByOrderSeqAsc(groupId, "N");

        return entities.stream()
                .map(CodeDetailResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void createDetail(CodeDetailRequest req, String adminId) {
        Long groupId = req.getCodeGroupId();
        String parentCodeId = req.getParentCodeId();

        Integer maxOrderSeq = codeDetailAdminRepository
                .findMaxOrderSeqByGroupAndParent(groupId, parentCodeId);

        int nextOrderSeq = (maxOrderSeq != null) ? maxOrderSeq + 1 : 1;

        CodeGroup group = codeGroupAdminRepository.findById(req.getCodeGroupId())
                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));

        CodeDetail detail = new CodeDetail();
        detail.setCodeId(req.getCodeId());
        detail.setCodeGroup(group);
        detail.setParentCodeId(req.getParentCodeId());
        detail.setCodeNameKo(req.getCodeNameKo());
        detail.setCodeNameEn(req.getCodeNameEn());
        detail.setOrderSeq(nextOrderSeq);
        detail.setUseTf(req.getUseTf());
        detail.setDelTf("N");
        detail.setRegAdm(adminId);
        detail.setRegDate(LocalDateTime.now());

        codeDetailAdminRepository.save(detail);
    }

    public void updateOrder(Long id, int newOrder) {
        CodeDetail detail = codeDetailAdminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메뉴 ID 오류"));
        detail.setOrderSeq(newOrder);
        codeDetailAdminRepository.save(detail);
    }

    @Transactional
    public void updateDetail(Long id, CodeDetailRequest req, String adminId) {
        CodeDetail detail = codeDetailAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeDetail Not Found"));

//        CodeGroup group = codeGroupAdminRepository.findById(req.getCodeGroupId())
//                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));

        //detail.setCodeGroup(group);
        detail.setParentCodeId(req.getParentCodeId());
        detail.setCodeNameKo(req.getCodeNameKo());
        detail.setCodeNameEn(req.getCodeNameEn());
        detail.setOrderSeq(req.getOrderSeq());
        detail.setUseTf(req.getUseTf());
        detail.setUpAdm(adminId);
        detail.setUpDate(LocalDateTime.now());

        codeDetailAdminRepository.save(detail);
    }

    @Transactional
    public void deleteDetail(Long id, String adminId) {
        CodeDetail detail = codeDetailAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeDetail Not Found"));
        detail.setDelTf("Y");
        detail.setDelAdm(adminId);
        detail.setDelDate(LocalDateTime.now());
        codeDetailAdminRepository.save(detail);
    }
}
