// com.hbs.hsbbo.common.util.FileUtil.java
package com.hbs.hsbbo.common.util;

import com.hbs.hsbbo.admin.domain.type.ContentType;
import com.hbs.hsbbo.admin.domain.type.FileType;
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
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
        if (baseDir == null) {
            throw new IllegalArgumentException("저장 경로가 유효하지 않습니다.");
        }

        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path fullPath = baseDir.resolve(fileName);
            Files.createDirectories(fullPath.getParent());
            Files.copy(file.getInputStream(), fullPath, StandardCopyOption.REPLACE_EXISTING);

            // uploadPath 기준 상대 경로만 잘라냄
            Path relativePath = Paths.get(fileStorageProperties.getUploadPath()).relativize(fullPath);

            // /files 경로 붙여서 리턴
            return "/files/" + relativePath.toString().replace("\\", "/");
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
            case LINK -> throw new IllegalArgumentException("LINK 타입은 파일 경로가 없습니다.");
        };

        return Paths.get(fileStorageProperties.getUploadPath(), subDir);
    }

    /*
    *  게시판용 Path 관련
    */

    public Path resolveBoardPath(String boardType) {
        if (boardType == null || boardType.isBlank()) {
            throw new IllegalArgumentException("boardType이 유효하지 않습니다.");
        }
        return Paths.get(fileStorageProperties.getUploadPath(), "board", boardType.toLowerCase());
    }

    /*
    * 확장자 반환
    */
    
    public String getExtension(String name) {
        return name != null && name.contains(".")
                ? name.substring(name.lastIndexOf('.') + 1)
                : "";
    }
}
