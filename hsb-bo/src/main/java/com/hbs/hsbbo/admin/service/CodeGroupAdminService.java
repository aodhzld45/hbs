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
        // 현재 등록된 그룹 중 orderSeq의 최대값 조회
        Integer maxOrderSeq = codeGroupAdminRepository.findMaxOrderSeq();
        int nextOrderSeq = (maxOrderSeq != null) ? maxOrderSeq + 1 : 1;

        CodeGroup group = new CodeGroup();
        group.setCodeGroupId(req.getCodeGroupId());
        group.setGroupName(req.getGroupName());
        group.setDescription(req.getDescription());
        group.setOrderSeq(nextOrderSeq);
        group.setUseTf(req.getUseTf());
        group.setDelTf("N");
        group.setRegAdm(adminId);
        group.setRegDate(LocalDateTime.now());

        codeGroupAdminRepository.save(group);
    }

    @Transactional
    public void updateOrder(Long id, int newOrder) {
        CodeGroup currentGroup = codeGroupAdminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("그룹 ID 오류"));

        int currentOrder = currentGroup.getOrderSeq();

        if (newOrder == currentOrder) {
            // 그대로면 변경할 필요 없음
            return;
        }

        if (newOrder < 1) {
            throw new IllegalArgumentException("순서는 1 이상이어야 합니다.");
        }

        if (newOrder < currentOrder) {
            // 순서 당김 → 기존 newOrder ~ currentOrder-1 까지 +1씩 증가
            codeGroupAdminRepository.incrementOrderBetween(newOrder, currentOrder - 1);
        } else {
            // 순서 밀림 → 기존 currentOrder+1 ~ newOrder 까지 -1씩 감소
            codeGroupAdminRepository.decrementOrderBetween(currentOrder + 1, newOrder);
        }

        currentGroup.setOrderSeq(newOrder);
        codeGroupAdminRepository.save(currentGroup);
    }

    @Transactional
    public void updateGroup(Long id, CodeGroupRequest req, String adminId) {
        CodeGroup group = codeGroupAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));
        group.setCodeGroupId(req.getCodeGroupId());
        group.setGroupName(req.getGroupName());
        group.setDescription(req.getDescription());
        group.setOrderSeq(req.getOrderSeq());
        group.setUseTf(req.getUseTf());
        group.setUpAdm(adminId);
        group.setUpDate(LocalDateTime.now());
        codeGroupAdminRepository.save(group);
    }

    @Transactional
    public void deleteGroup(Long id, String adminId) {
        CodeGroup group = codeGroupAdminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CodeGroup Not Found"));
        group.setDelTf("Y");
        group.setDelAdm(adminId);
        group.setDelDate(LocalDateTime.now());
        codeGroupAdminRepository.save(group);
    }
}

