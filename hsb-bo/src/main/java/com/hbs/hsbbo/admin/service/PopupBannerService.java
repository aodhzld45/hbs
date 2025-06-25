package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.PopupBanner;
import com.hbs.hsbbo.admin.dto.request.PopupBannerRequest;
import com.hbs.hsbbo.admin.dto.response.PopupBannerResponse;
import com.hbs.hsbbo.admin.repository.PopupBannerRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class PopupBannerService {
    private final PopupBannerRepository popupBannerRepository;
    private final FileUtil fileUtil;

    private final String BANNER_DIR = "banner";

    // 메인 노출용 팝업배너 목록
    public List<PopupBannerResponse> getVisiblePopupBanners() {
        return popupBannerRepository.findVisibleBanners(LocalDateTime.now())
                .stream()
                .map(PopupBannerResponse::from)
                .collect(Collectors.toList());
    }

    // 관리자 전체 팝업배너 목록 - 페이징 포함

    // 팝업 배너 등록
    public Long createPopupBanner(PopupBannerRequest request, String adminId) {
        MultipartFile file = request.getFile();
        String originalFileName = null;
        String savedPath = null;

        if (file != null && !file.isEmpty()) {
            originalFileName = file.getOriginalFilename();

            // type에 따라 경로 구분: popup 또는 banner
            String typeDir = request.getType().toLowerCase(); // "popup" or "banner"
            Path baseDir = fileUtil.resolvePath(typeDir); // /home/upload/popup 또는 /home/upload/banner
            savedPath = fileUtil.saveFile(baseDir, file); // /files/popup/uuid.png
        }

        PopupBanner popupBanner = new PopupBanner();
        popupBanner.setTitle(request.getTitle());
        popupBanner.setLinkUrl(request.getLinkUrl());
        popupBanner.setType(request.getType());
        popupBanner.setFilePath(savedPath);
        popupBanner.setOriginalFileName(originalFileName);
        popupBanner.setStartDate(request.getStartDate());
        popupBanner.setEndDate(request.getEndDate());
        popupBanner.setUseTf(request.getUseTf());
        popupBanner.setDelTf("N");
        popupBanner.setRegAdm(adminId);
        popupBanner.setRegDate(LocalDateTime.now());

        return popupBannerRepository.save(popupBanner).getId();

    }

    public void deleteBanner(Long id, String adminId) {
        popupBannerRepository.findById(id).ifPresent(banner -> {
            banner.setDelTf("Y");
            banner.setDelAdm(adminId);
            banner.setDelDate(LocalDateTime.now());
            popupBannerRepository.save(banner);
        });
    }





}
