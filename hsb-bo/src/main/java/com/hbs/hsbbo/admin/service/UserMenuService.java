package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.UserMenu;
import com.hbs.hsbbo.admin.dto.request.UserMenuRequest;
import com.hbs.hsbbo.admin.dto.response.UserMenuResponse;
import com.hbs.hsbbo.admin.dto.response.UserMenuTreeResponse;
import com.hbs.hsbbo.admin.repository.UserMenuRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserMenuService {
    @Autowired
    private final UserMenuRepository userMenuRepository;

    /*
     * 전체 사용자 메뉴 조회 (삭제되지 않은 메뉴)
     */
    public List<UserMenuResponse> getAllMenus() {
        return userMenuRepository.findByDelTf("N")
                .stream()
                .map(UserMenuResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserMenuTreeResponse> getMenuTree() {
        List<UserMenu> allMenus = userMenuRepository.findByDelTf("N");

        allMenus.sort(Comparator.comparingInt(UserMenu::getOrderSeq));

        Map<Long, UserMenuTreeResponse> map = new HashMap<>();
        List<UserMenuTreeResponse> rootMenus = new ArrayList<>();

        // 1. 모든 메뉴를 Map으로 변환
        for (UserMenu menu : allMenus) {
            map.put(menu.getId(), UserMenuTreeResponse.fromEntity(menu));
        }

        // 2. 계층 구조 구성
        for (UserMenu menu : allMenus) {
            Long parentId = menu.getParentId();
            UserMenuTreeResponse current = map.get(menu.getId());

            if (parentId == null) {
                rootMenus.add(current); // 최상위 메뉴
            } else {
                UserMenuTreeResponse parent = map.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(current);
                }
            }
        }

        return rootMenus;

    }

    // 사용자 메뉴 순서 변경
    @Transactional
    public void updateOrder(Long id, Integer newOrder) {
        UserMenu target = userMenuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 메뉴가 존재하지 않습니다."));

        target.setOrderSeq(newOrder); // 단순 순서 변경
    }

    
    /*
    * 사용자 메뉴 수정
    * */
    
    public UserMenuResponse updateMenu(Long id, UserMenuRequest request, String adminId) {
        UserMenu menu = userMenuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("수정할 사용자 메뉴가 존재하지 않습니다: " + id));

        menu.setName(request.getName());
        menu.setDepth(request.getDepth());
        menu.setParentId(request.getParentId());
        menu.setUrl(request.getUrl());
        menu.setOrderSeq(request.getOrderSeq());
        menu.setDescription(request.getDescription());
        menu.setUseTf(request.getUseTf());
        menu.setUpAdm(adminId);
        menu.setUpDate(LocalDateTime.now());

        userMenuRepository.save(menu);
        return UserMenuResponse.fromEntity(menu);
    }


    /*
     * 사용자 메뉴 생성
     */
    public UserMenuResponse createMenu(UserMenuRequest request, String adminId) {
        UserMenu menu = new UserMenu();
        menu.setName(request.getName());
        menu.setDepth(request.getDepth());
        menu.setParentId(request.getParentId());
        menu.setUrl(request.getUrl());
        menu.setOrderSeq(request.getOrderSeq());
        menu.setDescription(request.getDescription());
        menu.setUseTf(request.getUseTf());
        menu.setDelTf("N");
        menu.setRegAdm(adminId);
        menu.setRegDate(LocalDateTime.now());

        userMenuRepository.save(menu);

        return UserMenuResponse.fromEntity(menu);
    }

    /*
     * 사용자 메뉴 삭제 처리 (del_tf = 'Y')
     */
    public void deleteMenu(Long id, String adminId) {
        UserMenu menu = userMenuRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 메뉴가 존재하지 않습니다: " + id));

        menu.setDelTf("Y");
        menu.setDelDate(LocalDateTime.now());
        menu.setDelAdm(adminId);

        userMenuRepository.save(menu);
    }




}
