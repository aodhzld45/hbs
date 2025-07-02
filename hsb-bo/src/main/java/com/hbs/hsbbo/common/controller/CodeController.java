// src/main/java/com/hbs/hsbbo/common/controller/CodeController.java
package com.hbs.hsbbo.common.controller;

import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import com.hbs.hsbbo.common.dto.response.CodeGroupResponse;
import com.hbs.hsbbo.common.service.CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/common/codes")
public class CodeController {
    private final CodeService codeService;

    @GetMapping("/groups")
    public List<CodeGroupResponse> getGroups() {
        return codeService.getCodeGroups();
    }

    @GetMapping("/{groupId}/parents")
    public List<CodeDetailResponse> getParentCodes(@PathVariable String groupId) {
        return codeService.getParentCodes(groupId);
    }

    @GetMapping("/{groupId}/{parentCodeId}")
    public List<CodeDetailResponse> getChildCodes(@PathVariable String groupId,
                                                  @PathVariable String parentCodeId) {
        return codeService.getChildCodes(groupId, parentCodeId);
    }

}
