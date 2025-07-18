package com.hbs.hsbbo.admin.service.page;

import com.hbs.hsbbo.admin.domain.entity.page.Page;
import com.hbs.hsbbo.admin.dto.request.page.PageRequest;
import com.hbs.hsbbo.admin.dto.response.page.PageResponse;
import com.hbs.hsbbo.admin.repository.page.PageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageService {
    private final PageRepository pageRepository;

    public Long createPage(PageRequest request, String adminId) {
        if (pageRepository.existsByUrlAndDelTf(request.getUrl(), "N")) {
            throw new IllegalArgumentException("이미 존재하는 URL입니다.");
        }

        Page page = new Page();
        page.setName(request.getName());
        page.setUrl(request.getUrl());
        page.setUseTf(request.getUseTf());
        page.setDelTf("N");
        page.setRegAdm(adminId);
        page.setRegDate(LocalDateTime.now());

        Page saved = pageRepository.save(page);
        return saved.getId();
    }

    public List<PageResponse> getAllPages() {
        return pageRepository.findAll().stream()
                .filter(p -> !"Y".equals(p.getDelTf()))
                .map(PageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Long updatePage(Long id, PageRequest request, String adminId) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 페이지 ID입니다."));

        page.setName(request.getName());
        page.setUrl(request.getUrl());
        page.setUseTf(request.getUseTf());
        page.setDelTf("N");
        page.setUpAdm(adminId);
        page.setUpDate(LocalDateTime.now());

        return pageRepository.save(page).getId();
    }

    // 사용 여부 변경
    public Long updateUseTf(Long id, String useTf, String adminId) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 페이지 ID입니다."));
        page.setUseTf(useTf);
        page.setUpAdm(adminId);
        page.setUpDate(LocalDateTime.now());
        return pageRepository.save(page).getId();
    }

    // 삭제
    public Long deletePage(Long id, String adminId) {
        return pageRepository.findById(id)
                .map(page -> {
                    page.setDelTf("Y");
                    page.setDelAdm(adminId);
                    page.setDelDate(LocalDateTime.now());
                    return pageRepository.save(page).getId();
                })
                .orElseThrow(() -> new EntityNotFoundException("페이지를 찾을 수 없습니다. ID: " + id));
    }





}
