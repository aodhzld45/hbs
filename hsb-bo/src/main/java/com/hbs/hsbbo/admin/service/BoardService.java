package com.hbs.hsbbo.admin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.domain.entity.Board;
import com.hbs.hsbbo.admin.domain.entity.BoardConfig;
import com.hbs.hsbbo.admin.domain.entity.BoardFile;
import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.dto.response.BoardFileResponse;
import com.hbs.hsbbo.admin.dto.response.BoardListResponse;
import com.hbs.hsbbo.admin.dto.response.BoardResponse;
import com.hbs.hsbbo.admin.repository.BoardConfigRepository;
import com.hbs.hsbbo.admin.repository.BoardFileRepository;
import com.hbs.hsbbo.admin.repository.BoardRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import jakarta.annotation.Nullable;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardConfigRepository boardConfigRepository;
    private final BoardFileRepository boardFileRepository;
    private final FileUtil fileUtil;
    private final ObjectMapper objectMapper;

    private boolean isNoticeActive(Board board, LocalDateTime now) {
        if (!"Y".equalsIgnoreCase(board.getNoticeTf())) {
            return false;
        }
        if (board.getNoticeStart() == null && board.getNoticeEnd() == null) {
            return true;
        }
        boolean afterStart = board.getNoticeStart() == null || !now.isBefore(board.getNoticeStart());
        boolean beforeEnd = board.getNoticeEnd() == null || !now.isAfter(board.getNoticeEnd());
        return afterStart && beforeEnd;
    }

    public BoardListResponse getBoardList(String boardCode, String keyword, int page, int size, @Nullable String useTf) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        LocalDateTime now = LocalDateTime.now();

        BoardConfig boardConfig = getBoardConfigByCode(boardCode);
        List<Board> notices = "Y".equalsIgnoreCase(useTf)
                ? boardRepository.findActiveNotices(boardConfig.getBoardCode(), now)
                : boardRepository.findAllNoticesForAdmin(boardConfig.getBoardCode());

        if ("Y".equalsIgnoreCase(useTf)) {
            notices = notices.stream().filter(board -> "Y".equalsIgnoreCase(board.getUseTf())).toList();
        }

        Page<Board> boardPage = boardRepository.findRegularBoardsByBoardCodeAndKeyword(
                boardConfig.getBoardCode(),
                useTf,
                defaultString(keyword),
                pageable
        );

        List<Long> boardIds = boardPage.getContent().stream().map(Board::getId).toList();
        Map<Long, Boolean> fileMap = boardIds.isEmpty()
                ? Collections.emptyMap()
                : boardFileRepository.existsByBoardIds(boardIds);

        List<BoardResponse> noticeDtos = notices.stream()
                .map(BoardResponse::from)
                .toList();

        List<BoardResponse> itemDtos = boardPage.getContent().stream()
                .map(board -> {
                    BoardResponse dto = BoardResponse.from(board);
                    dto.setHasFile(fileMap.getOrDefault(board.getId(), false));
                    return dto;
                })
                .toList();

        return BoardListResponse.builder()
                .items(itemDtos)
                .notices(noticeDtos)
                .totalCount(boardPage.getTotalElements())
                .totalPages(boardPage.getTotalPages())
                .build();
    }

    public BoardResponse getBoardDetail(Long id) {
        Board board = boardRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시글이 존재하지 않습니다."));

        List<BoardFile> files = boardFileRepository.findByBoardIdAndDelTf(id, "N");
        BoardResponse dto = BoardResponse.from(board);
        dto.setHasFile(!files.isEmpty());
        dto.setFiles(files.stream().map(BoardFileResponse::from).toList());
        return dto;
    }

    @Transactional
    public BoardResponse getBoardDetailWithViewCount(Long id, HttpServletRequest request) {
        String sessionKey = "viewed_board_" + id;
        HttpSession session = request.getSession();
        if (session.getAttribute(sessionKey) == null) {
            boardRepository.incrementViewCount(id);
            session.setAttribute(sessionKey, true);
        }
        return getBoardDetail(id);
    }

    public void createBoard(BoardRequest request, List<MultipartFile> files) {
        BoardConfig boardConfig = getBoardConfigByCode(request.getBoardCode());
        validateCategorySelection(boardConfig, request.getCategoryCode());

        Board board = new Board();
        board.setBoardConfig(boardConfig);
        board.setCategoryCode(emptyToNull(request.getCategoryCode()));
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setWriterName(request.getWriterName());
        board.setUseTf(defaultYn(request.getUseTf(), "Y"));
        board.setNoticeTf(defaultYn(request.getNoticeTf(), "N"));
        board.setNoticeSeq(request.getNoticeSeq() == null ? 0 : request.getNoticeSeq());
        board.setNoticeStart(request.getNoticeStart());
        board.setNoticeEnd(request.getNoticeEnd());

        Board saved = boardRepository.save(board);
        saveBoardFiles(saved, files);
    }

    @Transactional
    public void updateBoard(Long id, BoardRequest request, List<MultipartFile> files) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("게시글이 존재하지 않습니다."));

        BoardConfig boardConfig = getBoardConfigByCode(request.getBoardCode());
        validateCategorySelection(boardConfig, request.getCategoryCode());

        board.setBoardConfig(boardConfig);
        board.setCategoryCode(emptyToNull(request.getCategoryCode()));
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setWriterName(request.getWriterName());
        board.setUseTf(defaultYn(request.getUseTf(), "Y"));
        board.setNoticeTf(defaultYn(request.getNoticeTf(), "N"));
        board.setNoticeSeq(request.getNoticeSeq() == null ? 0 : request.getNoticeSeq());
        board.setNoticeStart(request.getNoticeStart());
        board.setNoticeEnd(request.getNoticeEnd());
        board.setUpDate(LocalDateTime.now());

        boardRepository.save(board);

        List<Long> keepFileIds = request.getExistingFileIdList();
        if (keepFileIds.isEmpty()) {
            boardFileRepository.deleteByBoardId(board.getId());
        } else {
            boardFileRepository.deleteByBoardIdAndIdNotIn(board.getId(), keepFileIds);
        }

        saveBoardFiles(board, files);
    }

    public Long updateUseTf(Long id, String useTf, String adminId) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        board.setUseTf(defaultYn(useTf, "Y"));
        board.setUpAdm(adminId);
        board.setUpDate(LocalDateTime.now());
        return boardRepository.save(board).getId();
    }

    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("게시글이 존재하지 않습니다."));
        board.setDelTf("Y");
        board.setDelDate(LocalDateTime.now());
        boardRepository.save(board);
    }

    private BoardConfig getBoardConfigByCode(String boardCode) {
        return boardConfigRepository.findByBoardCodeIgnoreCaseAndDelTf(boardCode, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시판 설정이 존재하지 않습니다."));
    }

    private void validateCategorySelection(BoardConfig boardConfig, String categoryCode) {
        if (!"Y".equalsIgnoreCase(boardConfig.getCategoryTf())) {
            return;
        }

        String normalizedCategoryCode = emptyToNull(categoryCode);
        if (normalizedCategoryCode == null) {
            throw new IllegalArgumentException("카테고리 선택은 필수입니다.");
        }

        String categoryJson = boardConfig.getCategoryJson();
        if (categoryJson == null || categoryJson.isBlank()) {
            throw new IllegalArgumentException("게시판 카테고리 설정이 비어 있습니다.");
        }

        try {
            JsonNode categories = objectMapper.readTree(categoryJson);
            if (!categories.isArray()) {
                throw new IllegalArgumentException("게시판 카테고리 설정이 올바르지 않습니다.");
            }

            boolean matched = false;
            for (JsonNode category : categories) {
                String code = category.path("code").asText(null);
                String useTf = category.path("useTf").asText("Y");
                if (normalizedCategoryCode.equalsIgnoreCase(code) && "Y".equalsIgnoreCase(useTf)) {
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new IllegalArgumentException("유효하지 않은 카테고리입니다.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("게시판 카테고리 설정 파싱에 실패했습니다.");
        }
    }

    private void saveBoardFiles(Board board, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        List<BoardFile> fileEntities = new ArrayList<>();
        int order = 1;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            Path basePath = fileUtil.resolveBoardPath(board.getBoardConfig().getBoardCode());
            String savedPath = fileUtil.saveFile(basePath, file);
            String savedFileName = fileUtil.extractFileNameFromPath(savedPath);
            String extension = fileUtil.getExtension(file.getOriginalFilename());

            BoardFile boardFile = new BoardFile();
            boardFile.setBoard(board);
            boardFile.setFileName(savedFileName);
            boardFile.setOriginalFileName(file.getOriginalFilename());
            boardFile.setFilePath(savedPath);
            boardFile.setFileType(board.getBoardConfig().getBoardCode());
            boardFile.setFileSize(file.getSize());
            boardFile.setFileExtension(extension);
            boardFile.setDispSeq(order++);
            fileEntities.add(boardFile);
        }

        if (!fileEntities.isEmpty()) {
            boardFileRepository.saveAll(fileEntities);
        }
    }

    private String defaultString(String value) {
        return value == null ? "" : value.trim();
    }

    private String defaultYn(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return "Y".equalsIgnoreCase(value) ? "Y" : "N";
    }

    private String emptyToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
