package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import com.hbs.hsbbo.admin.dto.request.ContentFileRequest;
import com.hbs.hsbbo.admin.dto.response.ContentFileListResponse;
import com.hbs.hsbbo.admin.dto.response.ContentFileResponse;
import com.hbs.hsbbo.admin.repository.ContentFileRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import com.hbs.hsbbo.common.util.S3Uploader;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class ContentFileService {

    private final ContentFileRepository repository;
    private final FileUtil fileUtil;
    private final S3Uploader s3Uploader;


    // 콘텐츠 목록
//    public List<ContentFileResponse> getContentFiles() {
//        List<ContentFile> files = repository.findByFileTypeAndContentTypeAndDelTFOrderByFileIdDesc(FileType.VIDEO, ContentType.HBS,'N');
//
//        return files.stream()
//                .map(ContentFileResponse::fromEntity)
//                .collect(Collectors.toList());
//    }

    // 콘텐츠 목록 필터링 추가
    public ContentFileListResponse getContents(FileType fileType, ContentType contentType, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fileId"));

        Page<ContentFile> contentPage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            contentPage = repository.searchWithFilters(fileType, contentType, keyword.trim(), pageable);
        } else if (fileType != null && contentType != null) {
            contentPage = repository.findByFileTypeAndContentTypeAndDelTFOrderByFileIdDesc(fileType, contentType, 'N', pageable);
        } else if (fileType != null) {
            contentPage = repository.findByFileTypeAndDelTFOrderByFileIdDesc(fileType, 'N', pageable);
        } else if (contentType != null) {
            contentPage = repository.findByContentTypeAndDelTFOrderByFileIdDesc(contentType, 'N', pageable);
        } else {
            contentPage = repository.findByDelTF('N', pageable);
        }

        List<ContentFileResponse> items = contentPage.stream()
                .map(ContentFileResponse::fromEntity)
                .toList();

        return new ContentFileListResponse(items, contentPage.getTotalElements(), contentPage.getTotalPages());
    }

    // 콘텐츠 상세
    public ContentFileResponse getContentsDetail(Long id) {
        ContentFile detailContent = repository.findByFileIdAndDelTF(id, 'N')
                .orElseThrow(() -> new IllegalArgumentException("콘텐츠를 찾을 수 없습니다. ID = " + id));

        return ContentFileResponse.fromEntity(detailContent);
    }

    // 통합 콘텐츠 등록
    public void saveContentFile(ContentFileRequest request, MultipartFile file, MultipartFile thumbnail) {

        ContentFile entity = new ContentFile();

        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setContent(request.getContent());
        entity.setFileType(request.getFileType());
        entity.setContentType(request.getContentType());

        if (request.getFileType() == FileType.LINK) {
            // 링크 등록일 경우, fileUrl만 저장
            entity.setFileUrl(request.getFileUrl());
            entity.setExtension("link"); // 또는 null
            entity.setThumbnailUrl(request.getThumbnailUrl()); // 필요 시 썸네일 URL 필드 추가로 확장 가능
        } else {
            // 일반 파일 저장 처리
            Path filePath = fileUtil.resolvePathByType(request.getFileType(), request.getContentType());
            String fileUrl = fileUtil.saveFile(filePath, file);
            entity.setFileUrl(fileUrl);

            // 썸네일이 있을 경우 저장
            String thumbnailUrl = (thumbnail != null && !thumbnail.isEmpty())
                    ? fileUtil.saveFile(fileUtil.resolvePathByType(FileType.IMAGE, request.getContentType()), thumbnail)
                    : null;
            entity.setThumbnailUrl(thumbnailUrl);

            entity.setExtension(fileUtil.getExtension(file.getOriginalFilename()));
        }

        int nextDispSeq = repository.findMaxDispSeqByContentType(request.getContentType()) + 1;
        entity.setDispSeq(nextDispSeq);

        repository.save(entity);
    }

    // s3 업로드
    public void s3UploadContents(ContentFileRequest request, MultipartFile file, MultipartFile thumbnail) {

        // 1. S3 업로드
        if (request.getFileType() != FileType.LINK) {
            if (file != null) {
                String fileUrl = s3Uploader.uploadFileToS3(request.getFileType(), request.getContentType(), file);
                request.setFileUrl(fileUrl);
            }
            if (thumbnail != null) {
                String thumbUrl = s3Uploader.uploadFileToS3(FileType.IMAGE, request.getContentType(), thumbnail);
                request.setThumbnailUrl(thumbUrl);
            }
        }

        // 2. 엔티티 변환
        ContentFile entity = new ContentFile();

        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setContent(request.getContent());
        entity.setFileType(request.getFileType());
        entity.setContentType(request.getContentType());

        if (request.getFileType() == FileType.LINK) {
            // LINK 타입은 fileUrl, thumbnailUrl 그대로 사용
            entity.setFileUrl(request.getFileUrl());
            entity.setThumbnailUrl(request.getThumbnailUrl());
            entity.setExtension("link");
        } else {

            if (file != null) {
                entity.setFileUrl(request.getFileUrl()); // 이미 업로드된 URL 사용
                entity.setExtension(s3Uploader.getExtension(file.getOriginalFilename())); // 확장자 저장
            }
            if (thumbnail != null && !thumbnail.isEmpty()) {
                entity.setThumbnailUrl(request.getThumbnailUrl()); // 이미 업로드된 URL 사용
            }
            // 일반 파일 업로드
        /*
            if (file != null) {
                String fileUrl = s3Uploader.uploadFileToS3(request.getFileType(), request.getContentType(), file);
                entity.setFileUrl(fileUrl);
                entity.setExtension(s3Uploader.getExtension(file.getOriginalFilename()));
            }

            // 썸네일 업로드 (선택)
            if (thumbnail != null && !thumbnail.isEmpty()) {
                String thumbnailUrl = s3Uploader.uploadFileToS3(FileType.IMAGE, request.getContentType(), thumbnail);
                entity.setThumbnailUrl(thumbnailUrl);
            }
         */

        }

        int nextDispSeq = repository.findMaxDispSeqByContentType(request.getContentType()) + 1;
        entity.setDispSeq(nextDispSeq);

        repository.save(entity);
    }


    // 톱합 콘텐츠  수정
    public ContentFile updateContent(Long id, ContentFileRequest request, MultipartFile file, MultipartFile thumbnail) {

        ContentFile entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 콘텐츠가 존재하지 않습니다."));

        // 1. 기본 정보 수정
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setContent(request.getContent());
        entity.setContent(request.getContent());
        entity.setFileType(request.getFileType());
        entity.setContentType(request.getContentType());

        // 2. fileType이 LINK일 경우: fileUrl 및 썸네일 URL만 반영
        if (request.getFileType() == FileType.LINK) {
            entity.setFileUrl(request.getFileUrl());
            entity.setThumbnailUrl(request.getThumbnailUrl());
            entity.setExtension("link");
            return repository.save(entity); // 조기 저장 후 종료
        }

        // 3. 일반 파일 수정 시 저장 후 경로 재설정
        if (file != null && !file.isEmpty()) {
            Path filePath = fileUtil.resolvePathByType(request.getFileType(), request.getContentType());
            String fileUrl = fileUtil.saveFile(filePath, file);
            entity.setFileUrl(fileUrl);
            entity.setExtension(fileUtil.getExtension(file.getOriginalFilename()));
        }

        // 4. 썸네일 수정
        if (request.getFileType() == FileType.VIDEO && thumbnail != null && !thumbnail.isEmpty()) {
            Path thumbPath = fileUtil.resolvePathByType(FileType.IMAGE, request.getContentType());
            String thumbnailUrl = fileUtil.saveFile(thumbPath, thumbnail);
            entity.setThumbnailUrl(thumbnailUrl);
        }

        return repository.save(entity);
    }

    // 콘텐츠 삭제 (delTf = Y) - 실제 물리적 삭제가 아닌 논리적 삭제
    @Transactional
    public void softDeleteContent(Long id) {

        ContentFile content = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 콘텐츠가 없습니다."));

        content.setDelTF('Y');
        content.setDelDate(LocalDateTime.now());

        repository.save(content);
    }


}
