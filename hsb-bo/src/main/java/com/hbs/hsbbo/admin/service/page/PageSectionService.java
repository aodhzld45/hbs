package com.hbs.hsbbo.admin.service.page;


import com.hbs.hsbbo.admin.dto.response.page.PageResponse;
import com.hbs.hsbbo.admin.repository.page.PageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageSectionService {
    private final PageRepository pageRepository;

    public List<PageResponse> getAllPages() {
        return pageRepository.findAll().stream()
                .map(PageResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
