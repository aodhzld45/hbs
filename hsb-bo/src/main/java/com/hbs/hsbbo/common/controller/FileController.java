package com.hbs.hsbbo.common.controller;

import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private final FileUtil fileUtil;

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(
            @RequestParam String filePath,
            @RequestParam(required = false) String originalName
    ) throws IOException {
        Path absolutePath = fileUtil.resolveAbsolutePath(filePath);
        File file = absolutePath.toFile();

        if (!file.exists()) {
            throw new FileNotFoundException("파일이 존재하지 않습니다.");
        }

        // fallback: 저장된 파일명
        String downloadName = (originalName != null && !originalName.isBlank())
                ? originalName
                : file.getName();

        String encodedName = URLEncoder.encode(downloadName, StandardCharsets.UTF_8);
        Resource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")
                .contentLength(file.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}
