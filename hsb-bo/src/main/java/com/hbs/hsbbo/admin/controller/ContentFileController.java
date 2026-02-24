package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import com.hbs.hsbbo.admin.dto.request.ContentFileRequest;
import com.hbs.hsbbo.admin.dto.response.ContentFileListResponse;
import com.hbs.hsbbo.admin.dto.response.ContentFileResponse;
import com.hbs.hsbbo.admin.service.ContentFileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RequestMapping("/api")
@RestController
public class ContentFileController {

    private final ContentFileService contentFileService;
    private static final Logger log = LoggerFactory.getLogger(ContentFileController.class);

    // 콘텐츠 목록
//    @GetMapping("/content-files")
//    public ResponseEntity<List<ContentFileResponse>> getContentFiles() {
//        List<ContentFileResponse> contents = contentFileService.getContentFiles();
//        return ResponseEntity.ok(contents);
//    }

    // 콘텐츠 목록 필터링 추가
    @GetMapping("/contents")
    public ResponseEntity<ContentFileListResponse> getContents(
            @RequestParam(value = "fileType", required = false) FileType fileType,
            @RequestParam(value = "contentType", required = false) ContentType contentType,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        ContentFileListResponse result = contentFileService.getContents(fileType, contentType, keyword, page, size);

        return ResponseEntity.ok(result);

    }
    
    // 콘텐츠 상세
    @GetMapping("/content-files/{id}")
    public ResponseEntity<ContentFileResponse> getContentsDetail(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletRequest request
            ) {

        boolean isAdmin = (authorizationHeader != null && authorizationHeader.startsWith("Bearer "));

        ContentFileResponse response = isAdmin
                ? contentFileService.getContentsDetail(id)
                : contentFileService.getContentDetailWithViewCount(id, request);

        return ResponseEntity.ok(contentFileService.getContentsDetail(id));
    }
    
    // 콘텐츠 등록
    @AdminActionLog(action = "콘텐츠 등록", detail = "")
    @PostMapping(value = "/content-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadContents(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("content") String content,
            @RequestPart("fileType") String fileType,
            @RequestPart("contentType") String contentType,
            @RequestPart(value = "fileUrl", required = false) String fileUrl,
            @RequestPart(value = "thumbnailUrl", required = false) String  thumbnailUrl
    ) {

        try {
            ContentFileRequest request = new ContentFileRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setContent(content);
            request.setFileType(FileType.valueOf(fileType.toUpperCase()));
            request.setContentType(ContentType.valueOf(contentType.toUpperCase()));

            //링크 타입일 경우 저장
            if (fileUrl != null && "LINK".equalsIgnoreCase(request.getFileType().name())) {
                request.setFileUrl(fileUrl);
                request.setThumbnailUrl(thumbnailUrl);
            }

            System.out.println("요청 리퀘스트 정보" + request.toString());

            contentFileService.saveContentFile(request, file, thumbnail);
            return ResponseEntity.ok("콘텐츠 등록 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("파일 타입 또는 콘텐츠 타입이 잘못되었습니다.");
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔 로그로 확인
            return ResponseEntity.internalServerError().body("서버 오류 발생: " + e.getMessage());
        }
    }

    // s3 콘텐츠 업로드
    @AdminActionLog(action = "콘텐츠 S3 업로드", detail = "")
    @PostMapping(value = "/s3-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> s3UploadContents(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("content") String content,
            @RequestPart("fileType") String fileTypeStr,
            @RequestPart("contentType") String contentTypeStr,
            @RequestPart(value = "fileUrl", required = false) String fileUrl,
            @RequestPart(value = "thumbnailUrl", required = false) String thumbnailUrl
    ) {
        try {
            FileType fileType = FileType.valueOf(fileTypeStr.toUpperCase());
            ContentType contentType = ContentType.valueOf(contentTypeStr.toUpperCase());

            ContentFileRequest request = new ContentFileRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setContent(content);
            request.setFileType(fileType);
            request.setContentType(contentType);

            // 👉 LINK 타입은 fileUrl, thumbnailUrl 그대로 사용
            if (fileType == FileType.LINK) {
                request.setFileUrl(fileUrl);
                request.setThumbnailUrl(thumbnailUrl);
            }

            contentFileService.s3UploadContents(request, file, thumbnail);

            return ResponseEntity.ok("콘텐츠 등록 완료");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("잘못된 fileType 또는 contentType입니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("서버 오류: " + e.getMessage());
        }
    }



    // 콘텐츠 수정
    @AdminActionLog(action = "콘텐츠 수정", detail = "id={id}")
    @PutMapping(value = "/content-files/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateContent(
            @PathVariable Long id,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("content") String content,
            @RequestPart("fileType") String fileType,
            @RequestPart("contentType") String contentType,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "fileUrl", required = false) String fileUrl,
            @RequestPart(value = "thumbnailUrl", required = false) String  thumbnailUrl
    ) {

        try {
            ContentFileRequest request = new ContentFileRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setContent(content);
            request.setFileType(FileType.valueOf(fileType.toUpperCase()));
            request.setContentType(ContentType.valueOf(contentType.toUpperCase()));

            //링크 타입일 경우 저장
            if (fileUrl != null && "LINK".equalsIgnoreCase(request.getFileType().name())) {
                request.setFileUrl(fileUrl);
                request.setThumbnailUrl(thumbnailUrl);
            }

            // 서비스 로직
            ContentFile updateContent = contentFileService.updateContent(id, request, file, thumbnail);

            return ResponseEntity.ok(ContentFileResponse.fromEntity(updateContent));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("파일 타입 또는 콘텐츠 타입이 잘못되었습니다.");
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔 로그로 확인
            return ResponseEntity.internalServerError().body("서버 오류 발생: " + e.getMessage());
        }
    }

    // 콘텐츠 삭제 (delTf = Y) - 실제 물리적 삭제가 아닌 논리적 삭제
    @AdminActionLog(action = "콘텐츠 삭제", detail = "id={id}")
    @PutMapping("/content-files/{id}/delete")
    public ResponseEntity<?> softDeleteContent(@PathVariable Long id) {
        try {
            contentFileService.softDeleteContent(id);
            return ResponseEntity.ok("삭제 처리 완료");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("삭제 실패: " + e.getMessage());
        }
    }





}
