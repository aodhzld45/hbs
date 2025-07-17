package com.hbs.hsbbo.admin.service.page;

import com.hbs.hsbbo.admin.domain.entity.page.Page;
import com.hbs.hsbbo.admin.dto.request.page.PageRequest;
import com.hbs.hsbbo.admin.dto.response.page.PageResponse;
import com.hbs.hsbbo.admin.repository.page.PageRepository;
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



}
