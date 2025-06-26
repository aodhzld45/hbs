package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import com.hbs.hsbbo.admin.repository.AdminMenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminMenuService {

    @Autowired
    private AdminMenuRepository adminMenuRepository;

    public void updateOrder(Long id, int newOrder) {
        AdminMenu menu = adminMenuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메뉴 ID 오류"));
        menu.setOrderSequence(newOrder);
        adminMenuRepository.save(menu);
    }
}
