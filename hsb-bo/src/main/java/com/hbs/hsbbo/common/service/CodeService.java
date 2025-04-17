// src/main/java/com/hbs/hsbbo/common/service/CodeService.java
package com.hbs.hsbbo.common.service;

import com.hbs.hsbbo.common.domain.entity.CodeParent;
import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import com.hbs.hsbbo.common.domain.entity.CodeDetailId;
import com.hbs.hsbbo.common.dto.request.CodeParentRequest;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import com.hbs.hsbbo.common.dto.response.CodeParentResponse;
import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import com.hbs.hsbbo.common.repository.CodeParentRepository;
import com.hbs.hsbbo.common.repository.CodeDetailRepository;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CodeService {

    private final CodeParentRepository parentRepo;
    private final CodeDetailRepository detailRepo;

    public CodeService(CodeParentRepository parentRepo,
                       CodeDetailRepository detailRepo) {
        this.parentRepo = parentRepo;
        this.detailRepo = detailRepo;
    }

    // — 대분류 전체 조회 —
    public List<CodeParentResponse> listParents() {
        return parentRepo.findAll()
                .stream()
                .filter(e -> "Y".equals(e.getUseTf()) && "N".equals(e.getDelTf()))
                .map(CodeParentResponse::of)
                .collect(Collectors.toList());
    }

    // — 대분류 등록 —
    @Transactional
    public CodeParentResponse createParent(CodeParentRequest req) {
        CodeParent e = new CodeParent();
        e.setPcode(req.pcode());
        e.setPcodeNm(req.pcodeNm());
        e.setPcodeMemo(req.pcodeMemo());
        e.setPcodeSeqNo(req.pcodeSeqNo());
        CodeParent saved = parentRepo.save(e);
        return CodeParentResponse.of(saved);
    }

    // — 대분류 수정 —
    @Transactional
    public CodeParentResponse updateParent(Long id, CodeParentRequest req) {
        CodeParent e = parentRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("대분류코드가 없습니다: " + id));
        e.setPcode(req.pcode());
        e.setPcodeNm(req.pcodeNm());
        e.setPcodeMemo(req.pcodeMemo());
        e.setPcodeSeqNo(req.pcodeSeqNo());
        return CodeParentResponse.of(parentRepo.save(e));
    }

    // — 대분류 삭제(논리) —
    @Transactional
    public void deleteParent(Long id) {
        CodeParent e = parentRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("대분류코드가 없습니다: " + id));
        e.setDelTf("Y");
        parentRepo.save(e);
    }

    // — 하위 조회 —
    public List<CodeDetailResponse> listDetails(String pcode) {
        return detailRepo
                .findByPcodeAndUseTfAndDelTfOrderByDcodeSeqNo(pcode, "Y", "N")
                .stream()
                .map(CodeDetailResponse::of)
                .collect(Collectors.toList());
    }

    // — 하위 등록 —
    @Transactional
    public CodeDetailResponse createDetail(String pcode, CodeDetailRequest req) {
        CodeDetail e = new CodeDetail();
        e.setPcode(pcode);
        e.setDcode(req.dcode());
        e.setDcodeNm(req.dcodeNm());
        e.setDcodeExt(req.dcodeExt());
        e.setDcodeSeqNo(req.dcodeSeqNo());
        CodeDetail saved = detailRepo.save(e);
        return CodeDetailResponse.of(saved);
    }

    // — 하위 수정 —
    @Transactional
    public CodeDetailResponse updateDetail(String pcode,
                                           Long dcodeNo,
                                           CodeDetailRequest req) {
        CodeDetailId key = new CodeDetailId(pcode, dcodeNo);
        CodeDetail e = detailRepo.findById(key)
                .orElseThrow(() -> new IllegalArgumentException("하위코드가 없습니다: " + key));
        e.setDcode(req.dcode());
        e.setDcodeNm(req.dcodeNm());
        e.setDcodeExt(req.dcodeExt());
        e.setDcodeSeqNo(req.dcodeSeqNo());
        return CodeDetailResponse.of(detailRepo.save(e));
    }

    // — 하위 삭제(논리) —
    @Transactional
    public void deleteDetail(String pcode, Long dcodeNo) {
        CodeDetailId key = new CodeDetailId(pcode, dcodeNo);
        CodeDetail e = detailRepo.findById(key)
                .orElseThrow(() -> new IllegalArgumentException("하위코드가 없습니다: " + key));
        e.setDelTf("Y");
        detailRepo.save(e);
    }
}
