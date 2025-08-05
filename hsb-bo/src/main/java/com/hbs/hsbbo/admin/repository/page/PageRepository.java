package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.CustomPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PageRepository extends JpaRepository<CustomPage, Long> {
    boolean existsByUrlAndDelTf(String url, String delTf);
    Optional<CustomPage> findByUrlAndDelTf(String url, String delTf);

}
