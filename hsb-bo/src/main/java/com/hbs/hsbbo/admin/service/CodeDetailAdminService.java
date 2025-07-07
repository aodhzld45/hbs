package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.repository.CodeDetailAdminRepository;
import com.hbs.hsbbo.admin.repository.CodeGroupAdminRepository;
import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import com.hbs.hsbbo.common.domain.entity.CodeGroup;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import com.hbs.hsbbo.common.util.ExcelUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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

    // 엑셀 업로드 부분
    @Transactional
    public void uploadExcel(MultipartFile file, Long groupId, String adminId) {
        try (InputStream is = file.getInputStream()) {

            List<Map<String, String>> rows = ExcelUtil.parseExcel(is);

            int preview = Math.min(5, rows.size());
            for (int i = 0; i < preview; i++) {
                System.out.println("엑셀 Row " + (i + 1) + " → " + rows.get(i));
            }
            if (rows.size() > preview) {
                System.out.println("... 생략: 총 " + rows.size() + "건");
            }

            CodeGroup group = codeGroupAdminRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));

            for (Map<String, String> row : rows) {
                String codeId = row.get("codeId");
                String codeNameKo = row.get("codeNameKo");
                String codeNameEn = row.get("codeNameEn");
                String parentCodeId = row.get("parentCodeId");
                String orderSeqStr = row.get("orderSeq");
                String useTf = row.get("useTf");

                Integer orderSeq = orderSeqStr != null && !orderSeqStr.isEmpty()
                        ? Integer.parseInt(orderSeqStr)
                        : null;

                if (parentCodeId != null && parentCodeId.trim().isEmpty()) {
                    parentCodeId = null;
                }

                CodeDetail detail = new CodeDetail();
                detail.setCodeId(codeId);
                detail.setCodeGroup(group);
                detail.setParentCodeId(parentCodeId);
                detail.setCodeNameKo(codeNameKo);
                detail.setCodeNameEn(codeNameEn);
                detail.setOrderSeq(orderSeq);
                detail.setUseTf(useTf);
                detail.setDelTf("N");
                detail.setRegAdm(adminId);
                detail.setRegDate(LocalDateTime.now());

                codeDetailAdminRepository.save(detail);
            }

        } catch (Exception e) {
            throw new RuntimeException("엑셀 업로드 실패", e);
        }
    }

    public void updateOrder(Long id, int newOrder) {
        CodeDetail detail = codeDetailAdminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메뉴 ID 오류"));
        detail.setOrderSeq(newOrder);
        codeDetailAdminRepository.save(detail);
    }

    @Transactional
    public void updateDetailUseTf(Long id, String useTf, String adminId) {
        CodeDetail detail = codeDetailAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));
        detail.setUseTf(useTf);
        detail.setUpAdm(adminId);
        detail.setUpDate(LocalDateTime.now());
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
