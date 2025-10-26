package com.hbs.hsbbo.admin.ai.sitekey.repository;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SiteKeyRepository extends JpaRepository<SiteKey, Long>, SiteKeyRepositoryCustom {

    Optional<SiteKey> findBySiteKey(String siteKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SiteKey s where s.id = :id and s.delTf = 'N'")
    Optional<SiteKey> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select s from SiteKey s
            where s.delTf = 'N'
              and s.defaultWidgetConfig.id = :widgetConfigId
        """)
    List<SiteKey> findAllByDefaultWidgetConfigId(@Param("widgetConfigId") Long widgetConfigId);

    boolean existsBySiteKey(String siteKey);

    Page<SiteKey> findAllByStatus(Status status, Pageable pageable);

    // 상태만 빠르게 바꿔야 할 때 (부분 업데이트)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update SiteKey sk set sk.status = :status, sk.upAdm = :upAdm where sk.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") Status status, @Param("upAdm") String upAdm);

}
