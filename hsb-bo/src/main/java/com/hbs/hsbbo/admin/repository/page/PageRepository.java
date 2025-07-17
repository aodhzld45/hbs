package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.Page;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PageRepository extends JpaRepository<Page, Long> {
    boolean existsByUrlAndDelTf(String url, String delTf);

}
