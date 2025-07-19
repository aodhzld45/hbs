package com.hbs.hsbbo.admin.service.page;


import com.hbs.hsbbo.admin.domain.entity.page.Page;
import com.hbs.hsbbo.admin.domain.entity.page.PageSection;
import com.hbs.hsbbo.admin.domain.entity.page.PageSectionFile;
import com.hbs.hsbbo.admin.dto.request.page.PageSectionRequest;
import com.hbs.hsbbo.admin.repository.page.PageRepository;
import com.hbs.hsbbo.admin.repository.page.PageSectionFileRepository;
import com.hbs.hsbbo.admin.repository.page.PageSectionRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PageSectionService {
    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;
    private final PageSectionFileRepository pageSectionFileRepository;
    private final FileUtil fileUtil;

    @Transactional
    public Long createPageSection(PageSectionRequest request, String adminId, List<MultipartFile> files) {
        // 1. 페이지 엔티티 조회
        Page page = pageRepository.findById(request.getPageId())
                .orElseThrow(() -> new IllegalArgumentException("해당 페이지가 존재하지 않습니다."));

        // 2. 페이지 섹션 저장
        PageSection section = new PageSection();
        section.setPage(page);
        section.setSectionName(request.getSectionName());
        section.setLayoutType(request.getLayoutType());
        section.setOptionJson(request.getOptionJson());
        section.setOrderSeq(request.getOrderSeq());
        section.setUseTf(request.getUseTf());
        section.setRegAdm(adminId);
        section.setRegDate(LocalDateTime.now());

        PageSection saved = pageSectionRepository.save(section);

        // 3. 첨부파일 처리
        if (files != null && !files.isEmpty()) {
            List<PageSectionFile> fileEntities = new ArrayList<>();
            int order = 1; // 첨부파일 순서

            for (MultipartFile file : files) {

                String contentType = file.getContentType(); // 예: "image/png", "video/mp4"
                String ext = fileUtil.getExtension(file.getOriginalFilename()); // 예: "png", "mp4"

                String typeDir = "etc";

                if (contentType != null) {
                    if (contentType.startsWith("image")) {
                        typeDir = "image";
                    } else if (contentType.startsWith("video")) {
                        typeDir = "video";
                    }
                } else if (ext != null) {
                    // 확장자 기반 fallback
                    if (List.of("png", "jpg", "jpeg", "gif", "webp").contains(ext.toLowerCase())) {
                        typeDir = "image";
                    } else if (List.of("mp4", "mov", "avi", "webm").contains(ext.toLowerCase())) {
                        typeDir = "video";
                    }
                }

                // 1. 저장 경로 계산
                Path basePath = fileUtil.resolvePath("section/" + typeDir);

                // 2. 파일 저장 → /files/... 경로 반환
                String savedPath = fileUtil.saveFile(basePath, file);

                // 3. UUID 기반 저장 파일명 추출 (예: uuid.jpg)
                String savedFileName = fileUtil.extractFileNameFromPath(savedPath);

                // 4. 확장자 추출
                String extension = fileUtil.getExtension(file.getOriginalFilename());

                // 5. 엔티티 생성
                PageSectionFile sectionFile = new PageSectionFile();
                sectionFile.setSection(saved); // 외래키 연관관계 설정
                sectionFile.setFileName(savedFileName); // 실제 저장된 UUID 파일명
                sectionFile.setOriginalFileName(file.getOriginalFilename()); // 원본 파일명 저장
                sectionFile.setFilePath(savedPath);
                sectionFile.setFileType(contentType);
                sectionFile.setFileExtension(extension);
                sectionFile.setOrderSeq(order++); // 순서 1, 2, 3...

                fileEntities.add(sectionFile);
            }

            pageSectionFileRepository.saveAll(fileEntities);
            System.out.println(" 첨부파일 저장 완료 (" + fileEntities.size() + "건)");

        } else {
            System.out.println("첨부파일 없음");
        }

        return saved.getId();
    }
}
