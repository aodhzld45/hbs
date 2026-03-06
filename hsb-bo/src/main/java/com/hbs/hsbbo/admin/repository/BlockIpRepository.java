package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AppBlockIp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BlockIpRepository extends JpaRepository<AppBlockIp, Long> {

    @Query("select b from AppBlockIp b where b.useTf = 'Y' and b.delTf = 'N' order by b.regDate desc")
    List<AppBlockIp> findAllActive();

    @Query("""
           select b from AppBlockIp b
            where b.delTf = 'N'
              and (
                   :keyword is null
                   or :keyword = ''
                   or lower(b.ipAddress) like lower(concat('%', :keyword, '%'))
                   or lower(b.description) like lower(concat('%', :keyword, '%'))
              )
           """)
    Page<AppBlockIp> search(@Param("keyword") String keyword, Pageable pageable);

    Optional<AppBlockIp> findByIpAddress(String ipAddress);

    @Query("""
           select case when count(b) > 0 then true else false end
             from AppBlockIp b
            where b.useTf = 'Y'
              and b.delTf = 'N'
              and b.ipAddress = :ipAddress
           """)
    boolean existsActiveByIpAddress(@Param("ipAddress") String ipAddress);
}
