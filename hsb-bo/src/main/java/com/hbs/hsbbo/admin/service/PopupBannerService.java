package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.PopupBanner;
import com.hbs.hsbbo.admin.dto.request.PopupBannerRequest;
import com.hbs.hsbbo.admin.dto.response.PopupBannerListResponse;
import com.hbs.hsbbo.admin.dto.response.PopupBannerResponse;
import com.hbs.hsbbo.admin.repository.PopupBannerRepository;
import com.hbs.hsbbo.common.util.FileUtil;
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
        return popupBannerRepository.findVisiblePopupBanners(LocalDateTime.now())
                .stream()
                .map(PopupBannerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // 관리자 전체 팝업배너 목록 - 페이징 포함
    public PopupBannerListResponse getPopupBannerList(String type,String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<PopupBanner> bannerPage = popupBannerRepository
                .searchWithFilters(type, keyword, pageable);

        List<PopupBannerResponse> items = bannerPage
                .getContent()
                .stream()
                .map(PopupBannerResponse::fromEntity)
                .collect(Collectors.toList());

        PopupBannerListResponse response = new PopupBannerListResponse();
        response.setItems(items);
        response.setTotalCount(bannerPage.getTotalElements());
        response.setTotalPages(bannerPage.getTotalPages());

        return response;
    }

    // 팝업 배너 등록
    public Long createPopupBanner(PopupBannerRequest request, String adminId) {
        MultipartFile file = request.getFile();
        String originalFileName = null;
        String savedPath = null;

        Integer maxOrderSeq = popupBannerRepository.findMaxOrderSeqByType(request.getType());
        int newOrderSeq = maxOrderSeq + 1;

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
        popupBanner.setOrderSeq(newOrderSeq);
        popupBanner.setStartDate(request.getStartDate());
        popupBanner.setEndDate(request.getEndDate());
        popupBanner.setUseTf(request.getUseTf());
        popupBanner.setDelTf("N");
        popupBanner.setRegAdm(adminId);
        popupBanner.setRegDate(LocalDateTime.now());

        return popupBannerRepository.save(popupBanner).getId();

    }

    // 수정
    public void updatePopupBanner(Long id, PopupBannerRequest request, String adminId) {
        PopupBanner popupBanner = popupBannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배너 ID입니다."));

        // 파일 업로드 처리
        MultipartFile file = request.getFile();
        String originalFileName = popupBanner.getOriginalFileName();
        String savedPath = popupBanner.getFilePath();

        if (file != null && !file.isEmpty()) {
            originalFileName = file.getOriginalFilename();

            String typeDir = request.getType().toLowerCase(); // popup 또는 banner
            Path baseDir = fileUtil.resolvePath(typeDir);
            savedPath = fileUtil.saveFile(baseDir, file);
        }

        // 엔티티 수정
        popupBanner.setTitle(request.getTitle());
        popupBanner.setLinkUrl(request.getLinkUrl());
        popupBanner.setType(request.getType());
        popupBanner.setFilePath(savedPath);
        popupBanner.setOriginalFileName(originalFileName);
        popupBanner.setStartDate(request.getStartDate());
        popupBanner.setEndDate(request.getEndDate());
        popupBanner.setUseTf(request.getUseTf());
        popupBanner.setUpAdm(adminId);
        popupBanner.setUpDate(LocalDateTime.now());

        popupBannerRepository.save(popupBanner);
    }

    // 순서 변경
    @Transactional
    public void updatePopupBannerOrder(Long id, String direction, String adminId) {
        PopupBanner current = popupBannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배너 ID입니다."));

        Integer currentOrder = current.getOrderSeq();

        // 찾을 조건: 같은 타입의 배너 중, 위/아래 항목
        PopupBanner target;
        if (direction.equals("up")) {
            target = popupBannerRepository
                    .findFirstByOrderSeqLessThanOrderByOrderSeqDesc(currentOrder)
                    .orElse(null);
        } else {
            target = popupBannerRepository
                    .findFirstByOrderSeqGreaterThanOrderByOrderSeqAsc(currentOrder)
                    .orElse(null);
        }

        if (target == null) {
            // 위/아래로 이동할 대상이 없는 경우
            return;
        }

        // 두 개의 순서를 swap
        int tempOrder = current.getOrderSeq();
        current.setOrderSeq(target.getOrderSeq());
        target.setOrderSeq(tempOrder);

        current.setUpAdm(adminId);
        current.setUpDate(LocalDateTime.now());

        target.setUpAdm(adminId);
        target.setUpDate(LocalDateTime.now());

        popupBannerRepository.save(current);
        popupBannerRepository.save(target);
    }

    // 사용 여부 변경
    public void updateUseTf(Long id, String useTf, String adminId) {
        PopupBanner banner = popupBannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배너 ID입니다."));
        banner.setUseTf(useTf);
        banner.setUpAdm(adminId);
        banner.setUpDate(LocalDateTime.now());
        popupBannerRepository.save(banner);
    }

    // 삭제
    public void deleteBanner(Long id, String adminId) {
        popupBannerRepository.findById(id).ifPresent(banner -> {
            banner.setDelTf("Y");
            banner.setDelAdm(adminId);
            banner.setDelDate(LocalDateTime.now());
            popupBannerRepository.save(banner);
        });
    }





}
