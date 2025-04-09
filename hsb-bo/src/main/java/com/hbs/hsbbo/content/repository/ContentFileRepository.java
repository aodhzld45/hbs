package com.hbs.hsbbo.content.repository;

import com.hbs.hsbbo.content.entity.ContentFile;
import com.hbs.hsbbo.content.entity.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContentFileRepository extends JpaRepository<ContentFile, Long> {

    // 특정 ContentType 중 가장 큰 dispSeq 가져오기
    @Query("SELECT COALESCE(MAX(cf.dispSeq), 0) FROM ContentFile cf WHERE cf.contentType = :contentType")
    int findMaxDispSeqByContentType(@Param("contentType") ContentType contentType);

}
