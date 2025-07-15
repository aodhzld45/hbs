package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdminRepository extends JpaRepository<Admin, String>{

    @Query("""
        SELECT a 
        FROM Admin a
        WHERE a.isDeleted = false
       """)
    List<Admin> findIsDeletedFalse();

}
