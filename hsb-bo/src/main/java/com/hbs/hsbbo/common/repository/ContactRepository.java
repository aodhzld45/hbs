package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.domain.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    // 삭제되지 않은 전체 목록
    Page<Contact> findByDelTf(String delTf, Pageable pageable);

    // 문의 검색 키워드
    @Query("SELECT c FROM Contact c WHERE c.delTf = 'N' AND " +
            "(c.companyName LIKE %:kw% OR c.contactName LIKE %:kw% OR c.email LIKE %:kw%)")
    Page<Contact> findByKeyword(@Param("kw") String keyword, Pageable pageable);
}
