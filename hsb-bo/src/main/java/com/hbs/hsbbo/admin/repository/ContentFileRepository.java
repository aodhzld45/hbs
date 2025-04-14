package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContentFileRepository extends JpaRepository<ContentFile, Long> {

    // 특정 ContentType 중 가장 큰 dispSeq 가져오기
    @Query("SELECT COALESCE(MAX(cf.dispSeq), 0) FROM ContentFile cf WHERE cf.contentType = :contentType")
    int findMaxDispSeqByContentType(@Param("contentType") ContentType contentType);

    // 콘텐츠 목록
    //List<ContentFile> findByDelTFOrderByFileIdDesc(char delTF);
    List<ContentFile> findByFileTypeAndContentTypeAndDelTFOrderByFileIdDesc(FileType fileType, ContentType contentType, char delTF);

    // 콘텐츠 상세
    Optional<ContentFile> findByFileIdAndDelTF(Long id, char delTF);

}
