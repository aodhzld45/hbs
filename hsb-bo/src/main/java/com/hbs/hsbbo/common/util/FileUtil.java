// com.hbs.hsbbo.common.util.FileUtil.java
package com.hbs.hsbbo.common.util;

import com.hbs.hsbbo.content.entity.ContentType;
import com.hbs.hsbbo.content.entity.FileType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
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

            // baseDir = C:/upload/hsb/video/hbs
            // uploadPath = C:/upload/hsb
            String relativePath = baseDir.toAbsolutePath().toString()
                    .replace(Paths.get(fileStorageProperties.getUploadPath()).toAbsolutePath().toString(), "")
                    .replace("\\", "/")
                    .replaceAll("^/+", ""); // 앞에 붙은 슬래시 제거

            return "/files/" + relativePath + "/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    /**
     * 경로 계산
     */
    public Path resolvePathByType(FileType fileType, ContentType contentType) {
        String subDir = switch (fileType) {
            case VIDEO -> contentType == ContentType.HBS ? "video/hbs" : "video/etc";
            case IMAGE -> "image";
            case DOCUMENT -> "document/" + contentType.name().toLowerCase();
        };
        return Paths.get(fileStorageProperties.getUploadPath(), subDir);
    }

    public String getExtension(String name) {
        return name != null && name.contains(".")
                ? name.substring(name.lastIndexOf('.') + 1)
                : "";
    }
}
