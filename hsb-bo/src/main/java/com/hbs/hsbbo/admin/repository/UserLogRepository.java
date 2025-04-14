package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import com.hbs.hsbbo.admin.domain.entity.UserLog;
import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserLogRepository extends JpaRepository<UserLog, Long> {

}
