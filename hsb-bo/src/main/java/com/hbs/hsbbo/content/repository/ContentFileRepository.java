package com.hbs.hsbbo.content.repository;

import com.hbs.hsbbo.content.entity.ContentFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentFileRepository extends JpaRepository<ContentFile, Long> {
//    List<ContentFile> find
}
