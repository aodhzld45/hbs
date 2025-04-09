package com.hbs.hsbbo.content.controller;


import com.hbs.hsbbo.content.dto.ContentFileRequest;
import com.hbs.hsbbo.content.entity.ContentType;
import com.hbs.hsbbo.content.entity.FileType;
import com.hbs.hsbbo.content.repository.ContentFileRepository;
import com.hbs.hsbbo.content.service.ContentFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RequestMapping("/api")
@RestController
public class ContentFileController {

    private final ContentFileService contentFileService;

    @PostMapping(value = "/content-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadContents(
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("fileType") String fileType,
            @RequestPart("contentType") String contentType
            ) {

        // DTO 구성 수동 변환
        ContentFileRequest request = new ContentFileRequest();

        request.setTitle(title);
        request.setDescription(description);
        request.setFileType(FileType.valueOf(fileType));
        request.setContentType(ContentType.valueOf(contentType));

        //서비스 로직 구현
        contentFileService.saveContentFile(request, file, thumbnail);

        //응답 주로 메세지를 줌 아마? 쩝...
        return ResponseEntity.ok("콘텐츠 등록완료");
    }

}
