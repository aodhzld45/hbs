package com.hbs.hsbbo.admin.ai.sitekey.repository;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyQuery;
import org.springframework.data.domain.Page;

public interface SiteKeyRepositoryCustom {
    // 커스텀 검색 리포지토리 (동적 필터/정렬/페이징)
    Page<SiteKey> search(SiteKeyQuery query);
}
