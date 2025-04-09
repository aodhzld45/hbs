package com.hbs.hsbbo.common.util;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FileUtil {

    private final FileStorageProperties fileStorageProperties;

    /**
     * 파일 저장
     */
    public String saveFile(Path baseDir, MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path fullPath = baseDir.resolve(fileName);
            Files.createDirectories(fullPath.getParent());
            Files.copy(file.getInputStream(), fullPath, StandardCopyOption.REPLACE_EXISTING);

            // 반환 경로 예: /files/video/hbs/uuid.mp4
            String relativePath = baseDir.toString().replace(fileStorageProperties.getUploadPath(), "").replace("\\", "/");
            return "/files" + (relativePath.isEmpty() ? "" : "/" + relativePath) + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }


}
