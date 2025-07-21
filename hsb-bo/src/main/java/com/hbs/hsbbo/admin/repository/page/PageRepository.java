package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.CustomPage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PageRepository extends JpaRepository<CustomPage, Long> {
    boolean existsByUrlAndDelTf(String url, String delTf);

}
