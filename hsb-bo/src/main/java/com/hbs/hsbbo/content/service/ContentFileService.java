package com.hbs.hsbbo.content.service;

import com.hbs.hsbbo.common.util.FileUtil;
import com.hbs.hsbbo.content.dto.ContentFileRequest;
import com.hbs.hsbbo.content.entity.ContentFile;
import com.hbs.hsbbo.content.entity.FileType;
import com.hbs.hsbbo.content.repository.ContentFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

@RequiredArgsConstructor
@Service
public class ContentFileService {

    private final ContentFileRepository repository;
    private final FileUtil fileUtil;

    public void saveContentFile(ContentFileRequest request, MultipartFile file, MultipartFile thumbnail) {

        // 1. 저장 경로 계산
        Path filePath = fileUtil.resolvePathByType(request.getFileType(), request.getContentType());
        String fileUrl = fileUtil.saveFile(filePath, file);

        String thumbnailUrl = (thumbnail != null && !thumbnail.isEmpty())
                ? fileUtil.saveFile(fileUtil.resolvePathByType(FileType.IMAGE, request.getContentType()), thumbnail)
                : null;
        // 2. 실제 저장되는 엔티티 생성
        ContentFile entity = new ContentFile();

        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setFileType(request.getFileType());
        entity.setContentType(request.getContentType());
        entity.setFileUrl(fileUrl);
        entity.setThumbnailUrl(thumbnailUrl);
        entity.setExtension(fileUtil.getExtension(file.getOriginalFilename()));

        repository.save(entity);

    }


}
