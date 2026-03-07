package com.hbs.hsbbo.admin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.domain.entity.BoardConfig;
import com.hbs.hsbbo.admin.dto.request.BoardConfigRequest;
import com.hbs.hsbbo.admin.dto.response.BoardConfigListResponse;
import com.hbs.hsbbo.admin.dto.response.BoardConfigResponse;
import com.hbs.hsbbo.admin.repository.BoardConfigRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BoardConfigService {

    private final BoardConfigRepository boardConfigRepository;
    private final ObjectMapper objectMapper;

    public BoardConfigListResponse getBoardConfigList(String keyword, String useTf, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BoardConfig> configPage = boardConfigRepository.searchWithFilters(
                Optional.ofNullable(keyword).orElse(""),
                useTf,
                pageable
        );

        return BoardConfigListResponse.builder()
                .items(configPage.getContent().stream().map(BoardConfigResponse::from).toList())
                .totalCount(configPage.getTotalElements())
                .totalPages(configPage.getTotalPages())
                .build();
    }

    public BoardConfigResponse getBoardConfig(Long id) {
        BoardConfig boardConfig = boardConfigRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시판 설정이 존재하지 않습니다."));
        return BoardConfigResponse.from(boardConfig);
    }

    public BoardConfigResponse getBoardConfigByCode(String boardCode) {
        BoardConfig boardConfig = boardConfigRepository.findByBoardCodeIgnoreCaseAndDelTf(boardCode, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시판 설정이 존재하지 않습니다."));
        return BoardConfigResponse.from(boardConfig);
    }

    public Long createBoardConfig(BoardConfigRequest request, String adminId) {
        String normalizedBoardCode = normalizeBoardCode(request.getBoardCode());
        validateBoardCodeForCreate(normalizedBoardCode);
        validateCategoryJson(request.getCategoryTf(), request.getCategoryJson());

        BoardConfig boardConfig = new BoardConfig();
        applyRequest(boardConfig, request, normalizedBoardCode);
        boardConfig.setDelTf("N");
        boardConfig.setRegAdm(adminId);
        boardConfig.setRegDate(LocalDateTime.now());

        return boardConfigRepository.save(boardConfig).getId();
    }

    @Transactional
    public void updateBoardConfig(Long id, BoardConfigRequest request, String adminId) {
        BoardConfig boardConfig = boardConfigRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시판 설정이 존재하지 않습니다."));

        String normalizedBoardCode = normalizeBoardCode(request.getBoardCode());
        validateBoardCodeForUpdate(id, normalizedBoardCode);
        validateCategoryJson(request.getCategoryTf(), request.getCategoryJson());

        applyRequest(boardConfig, request, normalizedBoardCode);
        boardConfig.setUpAdm(adminId);
        boardConfig.setUpDate(LocalDateTime.now());
    }

    @Transactional
    public void updateUseTf(Long id, String useTf, String adminId) {
        BoardConfig boardConfig = boardConfigRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시판 설정이 존재하지 않습니다."));
        boardConfig.setUseTf(normalizeYn(useTf, "Y"));
        boardConfig.setUpAdm(adminId);
        boardConfig.setUpDate(LocalDateTime.now());
    }

    @Transactional
    public void deleteBoardConfig(Long id, String adminId) {
        BoardConfig boardConfig = boardConfigRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시판 설정이 존재하지 않습니다."));
        boardConfig.setDelTf("Y");
        boardConfig.setDelAdm(adminId);
        boardConfig.setDelDate(LocalDateTime.now());
    }

    private void applyRequest(BoardConfig boardConfig, BoardConfigRequest request, String normalizedBoardCode) {
        boardConfig.setBoardCode(normalizedBoardCode);
        boardConfig.setBoardName(request.getBoardName());
        boardConfig.setBoardDesc(request.getBoardDesc());
        boardConfig.setMenuPath(request.getMenuPath());
        boardConfig.setSkinType(defaultString(request.getSkinType(), "LIST"));
        boardConfig.setListSize(defaultInteger(request.getListSize(), 10));
        boardConfig.setSortSeq(defaultInteger(request.getSortSeq(), 0));
        boardConfig.setCommentTf(normalizeYn(request.getCommentTf(), "Y"));
        boardConfig.setFileTf(normalizeYn(request.getFileTf(), "Y"));
        boardConfig.setNoticeTf(normalizeYn(request.getNoticeTf(), "N"));
        boardConfig.setThumbnailTf(normalizeYn(request.getThumbnailTf(), "N"));
        boardConfig.setPeriodTf(normalizeYn(request.getPeriodTf(), "N"));
        boardConfig.setSecretTf(normalizeYn(request.getSecretTf(), "N"));
        boardConfig.setReplyTf(normalizeYn(request.getReplyTf(), "N"));
        boardConfig.setCategoryTf(normalizeYn(request.getCategoryTf(), "N"));
        boardConfig.setCategoryMode(resolveCategoryMode(request));
        boardConfig.setCategoryJson(resolveCategoryJson(request));
        boardConfig.setEditorTf(normalizeYn(request.getEditorTf(), "Y"));
        boardConfig.setReadRole(request.getReadRole());
        boardConfig.setWriteRole(request.getWriteRole());
        boardConfig.setUpdateRole(request.getUpdateRole());
        boardConfig.setDeleteRole(request.getDeleteRole());
        boardConfig.setUseTf(normalizeYn(request.getUseTf(), "Y"));
    }

    private String normalizeBoardCode(String boardCode) {
        if (boardCode == null || boardCode.isBlank()) {
            throw new IllegalArgumentException("게시판 코드는 필수입니다.");
        }
        return boardCode.trim().toUpperCase(Locale.ROOT);
    }

    private void validateBoardCodeForCreate(String boardCode) {
        if (boardConfigRepository.existsByBoardCodeIgnoreCase(boardCode)) {
            throw new IllegalArgumentException("이미 사용 중인 게시판 코드입니다.");
        }
    }

    private void validateBoardCodeForUpdate(Long id, String boardCode) {
        if (boardConfigRepository.existsByBoardCodeIgnoreCaseAndIdNot(boardCode, id)) {
            throw new IllegalArgumentException("이미 사용 중인 게시판 코드입니다.");
        }
    }

    private void validateCategoryJson(String categoryTf, String categoryJson) {
        if (!"Y".equalsIgnoreCase(categoryTf)) {
            return;
        }
        if (categoryJson == null || categoryJson.isBlank()) {
            throw new IllegalArgumentException("카테고리 사용 시 categoryJson은 필수입니다.");
        }
        try {
            JsonNode jsonNode = objectMapper.readTree(categoryJson);
            if (!jsonNode.isArray()) {
                throw new IllegalArgumentException("categoryJson은 JSON 배열이어야 합니다.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("categoryJson 형식이 올바르지 않습니다.");
        }
    }

    private String resolveCategoryMode(BoardConfigRequest request) {
        if (!"Y".equalsIgnoreCase(request.getCategoryTf())) {
            return "NONE";
        }
        return defaultString(request.getCategoryMode(), "SINGLE");
    }

    private String resolveCategoryJson(BoardConfigRequest request) {
        if (!"Y".equalsIgnoreCase(request.getCategoryTf())) {
            return null;
        }
        return request.getCategoryJson();
    }

    private String normalizeYn(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return "Y".equalsIgnoreCase(value) ? "Y" : "N";
    }

    private String defaultString(String value, String defaultValue) {
        return (value == null || value.isBlank()) ? defaultValue : value.trim();
    }

    private Integer defaultInteger(Integer value, Integer defaultValue) {
        return value == null ? defaultValue : value;
    }
}
