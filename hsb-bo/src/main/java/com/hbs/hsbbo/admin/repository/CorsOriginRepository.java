package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AppCorsOrigin;
import com.hbs.hsbbo.admin.dto.response.CorsOriginResponse;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CorsOriginRepository extends JpaRepository<AppCorsOrigin, Long> {
    // 기본 활성(사용 Y + 삭제 N) 조회
    @Query("select o from AppCorsOrigin o where o.useTf = 'Y' and o.delTf = 'N' order by o.regDate asc")
    List<AppCorsOrigin> findAllActive();

    @Query("""
           select o from AppCorsOrigin o
            where o.useTf = 'Y' and o.delTf = 'N'
              and (
                   (:tenantId is null and o.tenantId is null)
                   or o.tenantId = :tenantId
              )
            order by o.regDate asc
           """)
    List<AppCorsOrigin> findAllActiveByTenant(@Param("tenantId") String tenantId);

    // 소프트 삭제 아닌 단건 조회
    @Query("select o from AppCorsOrigin o where o.id = :id and o.useTf='Y' and o.delTf='N'")
    Optional<CorsOriginResponse> findActiveById(@Param("id") Long id);

    // 검색(키워드: origin_pat/description) + 페이지
    @Query("""
           select o from AppCorsOrigin o
            where o.delTf = 'N'
              and (
                   :keyword is null
                   or :keyword = ''
                   or lower(o.originPat) like lower(concat('%', :keyword, '%'))
                   or lower(o.description) like lower(concat('%', :keyword, '%'))
              )
              and (
                   (:tenantId is null and (o.tenantId is null or o.tenantId is null))
                   or o.tenantId = :tenantId
              )
           """)
    Page<AppCorsOrigin> search(@Param("keyword") String keyword,
                               @Param("tenantId") String tenantId,     // null 허용
                               Pageable pageable);

}
