package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.PageSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    List<PageSection> findByPageIdAndDelTf(Long pageId, String delTf);
}
