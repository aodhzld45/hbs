package com.hbs.hsbbo.content.service;

import com.hbs.hsbbo.common.util.FileUtil;
import com.hbs.hsbbo.content.dto.request.ContentFileRequest;
import com.hbs.hsbbo.content.dto.response.ContentFileResponse;
import com.hbs.hsbbo.content.entity.ContentFile;
import com.hbs.hsbbo.content.entity.FileType;
import com.hbs.hsbbo.content.repository.ContentFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ContentFileService {

    private final ContentFileRepository repository;
    private final FileUtil fileUtil;


    // 콘텐츠 불러오기
    public List<ContentFileResponse> getContentFiles() {
        List<ContentFile> files = repository.findByDelTF('N');

        return files.stream()
                .map(ContentFileResponse::fromEntity)
                .collect(Collectors.toList());

    }

    // 통합 콘텐츠 등록
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

        int nextDispSeq = repository.findMaxDispSeqByContentType(request.getContentType()) + 1;
        entity.setDispSeq(nextDispSeq);

        repository.save(entity);

    }


}
