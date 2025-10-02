package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdminRepository extends JpaRepository<Admin, String>{
    boolean existsByEmail(String email);

    @Query("""
        SELECT a 
        FROM Admin a
        WHERE a.isDeleted = false
       """)
    List<Admin> findIsDeletedFalse();

    @Query("""
            SELECT a.email
            FROM Admin a 
            WHERE a.groupId = :groupId 
           """)
    List<String> findEmailsByGroupId(@Param("groupId") Long groupId);

}
