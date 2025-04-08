package com.hbs.hsbbo.content;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContentFileRepository extends JpaRepository<ContentFile, Long> {
//    List<ContentFile> find
}
