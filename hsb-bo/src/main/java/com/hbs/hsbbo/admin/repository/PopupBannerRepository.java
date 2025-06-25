package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.PopupBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface PopupBannerRepository extends JpaRepository<PopupBanner, Long> {

    @Query("SELECT p FROM PopupBanner p WHERE p.useTf = 'Y' AND p.delTf = 'N' AND :now BETWEEN p.startDate AND p.endDate ORDER BY p.startDate DESC")
    List<PopupBanner> findVisibleBanners(LocalDateTime now);

}
