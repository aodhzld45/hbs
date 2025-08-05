package com.hbs.hsbbo.admin.service.page;


import com.hbs.hsbbo.admin.domain.entity.page.CustomPage;
import com.hbs.hsbbo.admin.domain.entity.page.PageSection;
import com.hbs.hsbbo.admin.domain.entity.page.PageSectionFile;
import com.hbs.hsbbo.admin.dto.request.page.PageSectionRequest;
import com.hbs.hsbbo.admin.dto.response.page.PageSectionFileResponse;
import com.hbs.hsbbo.admin.dto.response.page.PageSectionListResponse;
import com.hbs.hsbbo.admin.dto.response.page.PageSectionResponse;
import com.hbs.hsbbo.admin.repository.page.PageRepository;
import com.hbs.hsbbo.admin.repository.page.PageSectionFileRepository;
import com.hbs.hsbbo.admin.repository.page.PageSectionRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageSectionService {
    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;
    private final PageSectionFileRepository pageSectionFileRepository;
    private final FileUtil fileUtil;


    public PageSectionListResponse getPageSectionList(Long pageId, String keyword, int page, int size, String useTf) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderSeq").ascending());

        Page<PageSection> sectionPage;

        if ("Y".equalsIgnoreCase(useTf)) {
            // 사용자 요청: 사용중인 섹션만
            sectionPage = pageSectionRepository.findByPageIdAndUseTfAndKeyword(pageId, keyword, pageable);
        } else {
            // 관리자 요청: 전체 조회 (삭제 제외)
            sectionPage = pageSectionRepository.findByPageIdAndKeyword(pageId, keyword, pageable);
        }

        List<PageSection> sections = sectionPage.getContent();
        List<Long> sectionIds = sections.stream().map(PageSection::getId).toList();

        // 파일 유무 맵
        Map<Long, Boolean> fileMap = pageSectionFileRepository.existsBySectionIds(sectionIds);

        // 파일 목록 조회 및 DTO 변환 후 매핑
        //List<PageSectionFile> allFiles = pageSectionFileRepository.findBySectionIdInAndDelTf(sectionIds, "N");

        List<PageSectionFile> allFiles;

        if ("Y".equalsIgnoreCase(useTf)) {
            // 사용자 요청: 사용 중인 파일만
            allFiles = pageSectionFileRepository.findBySectionIdInAndDelTfAndUseTf(sectionIds, "N", "Y");
        } else {
            // 관리자 요청: 삭제 안 된 모든 파일
            allFiles = pageSectionFileRepository.findBySectionIdInAndDelTf(sectionIds, "N");
        }

        Map<Long, List<PageSectionFileResponse>> fileGroupMap = allFiles.stream()
                .map(PageSectionFileResponse::from)
                .collect(Collectors.groupingBy(PageSectionFileResponse::getSectionId)); // 섹션 ID 기준 그룹화

        // 페이지 섹션 DTO 구성
        List<PageSectionResponse> items = sections.stream()
                .map(section -> {
                    PageSectionResponse dto = PageSectionResponse.fromEntity(section);
                    dto.setHasFile(fileMap.getOrDefault(section.getId(), false));
                    dto.setFiles(fileGroupMap.getOrDefault(section.getId(), List.of()));
                    return dto;
                })
                .toList();

        return new PageSectionListResponse(items, sectionPage.getTotalElements(), sectionPage.getTotalPages());
    }

    @Transactional
    public Long createPageSection(PageSectionRequest request, String adminId, List<MultipartFile> files) {
        // 1. 페이지 엔티티 조회
        CustomPage page = pageRepository.findById(request.getPageId())
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
                sectionFile.setRegAdm(adminId);
                sectionFile.setRegDate(LocalDateTime.now());
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

    @Transactional
    public Long updatePageSection(Long id, PageSectionRequest request, List<MultipartFile> files, String adminId) {
        // 1. 페이지 섹션 조회
        PageSection section = pageSectionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 섹션이 존재하지 않습니다."));

        // 2. 필드 업데이트
        section.setSectionName(request.getSectionName());
        section.setLayoutType(request.getLayoutType());
        section.setOptionJson(request.getOptionJson());
        section.setOrderSeq(request.getOrderSeq());
        section.setUseTf(request.getUseTf());
        section.setUpAdm(adminId);
        section.setUpDate(LocalDateTime.now());

        pageSectionRepository.save(section);
        System.out.println("수정된 섹션 ID: " + section.getId());

        // 3. 기존 파일 유지 목록 파싱
        List<Long> keepFileIds = request.getExistingFileIdList(); // 클라이언트에서 전달된 유지 파일 ID 리스트

        // 4. 기존 파일 삭제 (제외할 ID가 없다면 전체 삭제)
        if (keepFileIds.isEmpty()) {
            pageSectionFileRepository.deleteBySectionId(section.getId());
        } else {
            pageSectionFileRepository.deleteBySectionIdAndIdNotIn(section.getId(), keepFileIds);
        }

        // 5. 신규 파일 저장
        if (files != null && !files.isEmpty()) {
            List<PageSectionFile> fileEntities = new ArrayList<>();
            int order = 1;

            for (MultipartFile file : files) {
                String contentType = file.getContentType(); // 예: "image/png", "video/mp4"
                String ext = fileUtil.getExtension(file.getOriginalFilename());

                String typeDir = "etc";
                if (contentType != null) {
                    if (contentType.startsWith("image")) typeDir = "image";
                    else if (contentType.startsWith("video")) typeDir = "video";
                } else if (ext != null) {
                    if (List.of("png", "jpg", "jpeg", "gif", "webp").contains(ext.toLowerCase())) {
                        typeDir = "image";
                    } else if (List.of("mp4", "mov", "avi", "webm").contains(ext.toLowerCase())) {
                        typeDir = "video";
                    }
                }

                Path basePath = fileUtil.resolvePath("section/" + typeDir);
                String savedPath = fileUtil.saveFile(basePath, file);
                String savedFileName = fileUtil.extractFileNameFromPath(savedPath);
                String extension = fileUtil.getExtension(file.getOriginalFilename());

                PageSectionFile sectionFile = new PageSectionFile();
                sectionFile.setSection(section);
                sectionFile.setFileName(savedFileName);
                sectionFile.setOriginalFileName(file.getOriginalFilename());
                sectionFile.setFilePath(savedPath);
                sectionFile.setFileType(contentType);
                sectionFile.setFileExtension(extension);
                sectionFile.setFileSize(file.getSize());
                sectionFile.setOrderSeq(order++);
                sectionFile.setRegAdm(adminId);
                sectionFile.setRegDate(LocalDateTime.now());

                fileEntities.add(sectionFile);
            }

            pageSectionFileRepository.saveAll(fileEntities);
            System.out.println("신규 파일 저장 완료 (" + fileEntities.size() + "건)");
        } else {
            System.out.println("신규 첨부파일 없음");
        }
        return section.getId();
    }

    // 사용여부 변경
    @Transactional
    public void updateSectionOrders(List<PageSectionRequest> requestList) {
        for (PageSectionRequest req : requestList) {
            pageSectionRepository.findById(req.getId()).ifPresent(section -> {
                section.setOrderSeq(req.getOrderSeq());
            });
        }
        pageSectionRepository.flush();
    }


    // 사용 여부 변경
    public Long updateUseTf(Long id, String useTf, String adminId) {
        PageSection pageSection = pageSectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 페이지 섹션 ID입니다."));
        pageSection.setUseTf(useTf);
        pageSection.setUpAdm(adminId);
        pageSection.setUpDate(LocalDateTime.now());
        return pageSectionRepository.save(pageSection).getId();
    }

    // 삭제
    public Long deletePage(Long id, String adminId) {
        return pageSectionRepository.findById(id)
                .map(page -> {
                    page.setDelTf("Y");
                    page.setDelAdm(adminId);
                    page.setDelDate(LocalDateTime.now());
                    return pageSectionRepository.save(page).getId();
                })
                .orElseThrow(() -> new EntityNotFoundException("페이지 섹션을 찾을 수 없습니다. ID: " + id));
    }

}
