package com.hbs.hsbbo.content.controller;


import com.hbs.hsbbo.content.dto.request.ContentFileRequest;
import com.hbs.hsbbo.content.dto.response.ContentFileResponse;
import com.hbs.hsbbo.content.entity.ContentType;
import com.hbs.hsbbo.content.entity.FileType;
import com.hbs.hsbbo.content.service.ContentFileService;
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
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("fileType") String fileType,
            @RequestPart("contentType") String contentType
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 없습니다.");
        }

        try {
            ContentFileRequest request = new ContentFileRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setFileType(FileType.valueOf(fileType.toUpperCase()));
            request.setContentType(ContentType.valueOf(contentType.toUpperCase()));

            contentFileService.saveContentFile(request, file, thumbnail);
            return ResponseEntity.ok("콘텐츠 등록 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("파일 타입 또는 콘텐츠 타입이 잘못되었습니다.");
        } catch (Exception e) {
            e.printStackTrace(); // 콘솔 로그로 확인
            return ResponseEntity.internalServerError().body("서버 오류 발생: " + e.getMessage());
        }
    }
}
