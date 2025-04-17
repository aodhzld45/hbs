package com.hbs.hsbbo.admin.controller;


import com.hbs.hsbbo.admin.dto.request.ContentFileRequest;
import com.hbs.hsbbo.admin.dto.response.ContentFileResponse;
import com.hbs.hsbbo.admin.domain.entity.ContentFile;
import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
import com.hbs.hsbbo.admin.service.ContentFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/api")
@RestController
public class ContentFileController {

    private final ContentFileService contentFileService;

    // 콘텐츠 목록
    @GetMapping("/content-files")
    public ResponseEntity<List<ContentFileResponse>> getContentFiles() {
        List<ContentFileResponse> contents = contentFileService.getContentFiles();
        return ResponseEntity.ok(contents);
    }
    
    // 콘텐츠 상세
    @GetMapping("/content-files/{id}")
    public ResponseEntity<ContentFileResponse> getContentsDetail(@PathVariable Long id) {
        return ResponseEntity.ok(contentFileService.getContentsDetail(id));
    }
    
    // 콘텐츠 등록
    @PostMapping(value = "/content-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadContents(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("fileType") String fileType,
            @RequestPart("contentType") String contentType,
            @RequestPart(value = "fileUrl", required = false) String fileUrl,
            @RequestPart(value = "thumbnailUrl", required = false) String  thumbnailUrl
    ) {

        try {
            ContentFileRequest request = new ContentFileRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setFileType(FileType.valueOf(fileType.toUpperCase()));
            request.setContentType(ContentType.valueOf(contentType.toUpperCase()));

            //링크 타입일 경우 저장
            if (fileUrl != null && !fileUrl.isBlank()) {
                request.setFileUrl(fileUrl);
                request.setThumbnailUrl(thumbnailUrl); //
            }

            contentFileService.saveContentFile(request, file, thumbnail);
            return ResponseEntity.ok("콘텐츠 등록 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("파일 타입 또는 콘텐츠 타입이 잘못되었습니다.");
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔 로그로 확인
            return ResponseEntity.internalServerError().body("서버 오류 발생: " + e.getMessage());
        }
    }

    // 콘텐츠 수정
    @PutMapping(value = "/content-files/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateContent(
            @PathVariable Long id,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("fileType") String fileType,
            @RequestPart("contentType") String contentType,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail
    ) {

        try {
            ContentFileRequest request = new ContentFileRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setFileType(FileType.valueOf(fileType.toUpperCase()));
            request.setContentType(ContentType.valueOf(contentType.toUpperCase()));

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
