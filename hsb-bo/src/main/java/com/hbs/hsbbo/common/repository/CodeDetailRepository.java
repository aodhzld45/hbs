// src/main/java/com/hbs/hsbbo/common/repository/CodeDetailRepository.java
package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;

import java.util.List;

public interface CodeDetailRepository  {
    List<CodeDetailResponse> findParentCodes(String codeGroupId);

    List<CodeDetailResponse> findChildCodes(String codeGroupId, String parentCodeId);
}
