package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ContentFileRepository extends JpaRepository<ContentFile, Long> {

    // dispSeq 최대값 조회
    @Query("SELECT COALESCE(MAX(cf.dispSeq), 0) FROM ContentFile cf WHERE cf.contentType = :contentType")
    int findMaxDispSeqByContentType(@Param("contentType") ContentType contentType);

    @Query("SELECT cf FROM ContentFile cf " +
            "WHERE cf.delTF = 'N' " +
            "AND (:fileType IS NULL OR cf.fileType = :fileType) " +
            "AND (:contentType IS NULL OR cf.contentType = :contentType) " +
            "AND (:keyword IS NULL OR LOWER(cf.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY cf.fileId DESC")
    Page<ContentFile> searchWithFilters(
            @Param("fileType") FileType fileType,
            @Param("contentType") ContentType contentType,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    // 동적 조건 필터링 없이 모든 콘텐츠 목록 (페이징)
    Page<ContentFile> findByDelTF(char delTF, Pageable pageable);

    // 파일타입 + 콘텐츠타입 필터링 (페이징)
    Page<ContentFile> findByFileTypeAndContentTypeAndDelTFOrderByFileIdDesc(FileType fileType, ContentType contentType, char delTF, Pageable pageable);

    // 파일타입만 필터링 (페이징)
    Page<ContentFile> findByFileTypeAndDelTFOrderByFileIdDesc(FileType fileType, char delTF, Pageable pageable);

    // 콘텐츠타입만 필터링 (페이징)
    Page<ContentFile> findByContentTypeAndDelTFOrderByFileIdDesc(ContentType contentType, char delTF, Pageable pageable);

    // 상세 조회
    Optional<ContentFile> findByFileIdAndDelTF(Long fileId, char delTF);

}
