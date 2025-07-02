// src/main/java/com/hbs/hsbbo/common/service/CodeService.java
package com.hbs.hsbbo.common.service;

import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import com.hbs.hsbbo.common.dto.response.CodeGroupResponse;
import com.hbs.hsbbo.common.repository.CodeDetailRepository;
import com.hbs.hsbbo.common.repository.CodeGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CodeService {

    private final CodeGroupRepository codeGroupRepository;
    private final CodeDetailRepository codeDetailRepository;

    public List<CodeGroupResponse> getCodeGroups() {
        return codeGroupRepository.findAllGroups();
    }

    public List<CodeDetailResponse> getParentCodes(String codeGroupId) {
        return codeDetailRepository.findParentCodes(codeGroupId);
    }

    public List<CodeDetailResponse> getChildCodes(String codeGroupId, String parentCodeId) {
        return codeDetailRepository.findChildCodes(codeGroupId, parentCodeId);
    }

}
