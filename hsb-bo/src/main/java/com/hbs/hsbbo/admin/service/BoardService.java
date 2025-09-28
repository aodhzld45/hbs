package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.Board;
import com.hbs.hsbbo.admin.domain.entity.BoardFile;
import com.hbs.hsbbo.admin.domain.type.BoardType;
import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.dto.response.BoardFileResponse;
import com.hbs.hsbbo.admin.dto.response.BoardListResponse;
import com.hbs.hsbbo.admin.dto.response.BoardResponse;
import com.hbs.hsbbo.admin.repository.BoardFileRepository;
import com.hbs.hsbbo.admin.repository.BoardRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class BoardService {
    @Autowired
    private final BoardRepository boardRepository;

    @Autowired
    private final BoardFileRepository boardFileRepository;

    @Autowired
    private final FileUtil fileUtil;

    /* ========================= 유틸: 공지 활성 판단 ========================= */
    private boolean isNoticeActive(Board b, LocalDateTime now) {
        if (!"Y".equalsIgnoreCase(b.getNoticeTf())) return false;
        // 기간이 모두 비어있으면 상시 공지
        if (b.getNoticeStart() == null && b.getNoticeEnd() == null) return true;
        // 시작/만료 한쪽만 있을 수도 있음
        boolean afterStart = (b.getNoticeStart() == null) || !now.isBefore(b.getNoticeStart());
        boolean beforeEnd  = (b.getNoticeEnd() == null) || !now.isAfter(b.getNoticeEnd());
        return afterStart && beforeEnd;
    }

    public BoardListResponse getBoardList(BoardType boardType, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        LocalDateTime now = LocalDateTime.now();

        // 1) 활성 공지 먼저 조회 (boardType 범위, del_tf/use_tf 고려)
        //    Repository에 맞는 JPQL/QueryMethod를 별도로 두는 걸 권장
        //    여기서는 간단히 전체를 가져와 필터 → 정렬하는 형태
        //    (데이터가 많아지면 반드시 쿼리 레벨에서 필터/정렬)
        List<Board> allForType = boardRepository.findByBoardTypeAndDelTfAndUseTf(boardType, "N", "Y");
        List<Board> activeNotices = allForType.stream()
                .filter(b -> isNoticeActive(b, now))
                .sorted(Comparator
                        .comparingInt(Board::getNoticeSeq).reversed() // 우선순위 내림차순
                        .thenComparing(Board::getId).reversed())       // 동일 우선순위면 최신순
                .toList();

        // 공지 ID 집합(중복 제거용)
        Set<Long> noticeIds = activeNotices.stream().map(Board::getId).collect(Collectors.toSet());

        // 2) 일반글 페이지 조회 (기존 메서드를 사용하되, 공지 제외)
        //    - 현재 findByBoardTypeAndKeyword 가 공지를 포함한다면,
        //      Repository에 "공지 제외" 조건을 추가한 메서드를 하나 더 두는게 제일 깔끔
        Page<Board> boardPage = boardRepository.findByBoardTypeAndKeyword(boardType, keyword, pageable);
        List<Board> pageContent = boardPage.getContent().stream()
                .filter(b -> !noticeIds.contains(b.getId())) // 공지 제외
                .toList();


        // 게시글 목록 조회
/*        Page<Board> boardPage = boardRepository.findByBoardTypeAndKeyword(boardType, keyword, pageable);
        List<Board> boards = boardPage.getContent();
        List<Long> boardIds = boards.stream().map(Board::getId).toList();*/

        // 3) 파일 유무 맵
        List<Long> itemIds = pageContent.stream().map(Board::getId).toList();
        Map<Long, Boolean> fileMap = itemIds.isEmpty()
                ? Collections.emptyMap()
                : boardFileRepository.existsByBoardIds(itemIds);
/*
        Map<Long, Boolean> fileMap = boardFileRepository.existsByBoardIds(boardIds);


*/
        // 4) DTO 변환
        List<BoardResponse> noticeDtos = activeNotices.stream()
                .map(BoardResponse::from)
                .peek(dto -> {
                    // 공지 리스트에 파일뱃지 필요하면 별도 조회/설정
                    // 여기서는 생략하거나 필요시 아래처럼 처리:
                    // dto.setHasFile(fileMap.getOrDefault(dto.getId(), false));
                })
                .toList();

        List<BoardResponse> itemDtos = pageContent.stream()
                .map(board -> {
                    BoardResponse dto = BoardResponse.from(board);
                    dto.setHasFile(fileMap.getOrDefault(board.getId(), false));
                    return dto;
                })
                .toList();

        // Entity → DTO + hasFile 적용
/*        List<BoardResponse> items = boards.stream()
                .map(board -> {
                    BoardResponse dto = BoardResponse.from(board);
                    dto.setHasFile(fileMap.getOrDefault(board.getId(), false));
                    return dto;
                })
                .toList();

           return new BoardListResponse(items, boardPage.getTotalElements(), boardPage.getTotalPages());
          */


        // 5) 응답 조립 (기존 구조 유지 + notices 추가)
        BoardListResponse resp = BoardListResponse.builder()
                .items(itemDtos)
                .totalCount(boardPage.getTotalElements())
                .totalPages(boardPage.getTotalPages())
                .build();
        resp.setNotices(noticeDtos);
        return resp;

    }

    public BoardResponse getBoardDetail(Long id) {
        Board board = boardRepository.findByIdAndDelTf(id, "N")
                .orElseThrow(() -> new EntityNotFoundException("게시글이 존재하지 않거나 삭제되었습니다."));

        List<BoardFile> files = boardFileRepository.findByBoardIdAndDelTf(id, "N");

        BoardResponse dto = BoardResponse.from(board);
        dto.setHasFile(!files.isEmpty());
        dto.setFiles(files.stream().map(BoardFileResponse::from).toList());

        return dto;
    }

    @Transactional
    public BoardResponse getBoardDetailWithViewCount(Long id, HttpServletRequest request) {
        // 조회수 증가 (세션 중복 방지 포함)
        String sessionKey = "viewed_board_" + id;
        HttpSession session = request.getSession();
        if (session.getAttribute(sessionKey) == null) {
            boardRepository.incrementViewCount(id);
            session.setAttribute(sessionKey, true);
        }

        return getBoardDetail(id); // 기존 조회 로직 재사용
    }

    public void createBoard(BoardRequest request, List<MultipartFile> files) {
        // 1. 게시글 저장
        Board board = new Board();
        board.setBoardType(BoardType.valueOf(request.getBoardType()));
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setWriterName(request.getWriterName());
        board.setUseTf(request.getUseTf());

        // ===== 공지 필드 반영 =====
        board.setNoticeTf(request.getNoticeTf());
        board.setNoticeSeq(request.getNoticeSeq());
        board.setNoticeStart(request.getNoticeStart()); // null 허용
        board.setNoticeEnd(request.getNoticeEnd()); // null 허용

        Board saved = boardRepository.save(board);

        // 2. 첨부파일 처리
        if (files != null && !files.isEmpty()) {
            List<BoardFile> fileEntities = new ArrayList<>();
            int order = 1; // 첨부파일 순서

            for (MultipartFile file : files) {
                // 1. 저장 경로 계산
                Path basePath = fileUtil.resolveBoardPath(String.valueOf(board.getBoardType()));

                // 2. 파일 저장 → /files/... 경로 반환
                String savedPath = fileUtil.saveFile(basePath, file);

                // 3. UUID 기반 저장 파일명 추출 (예: uuid.jpg)
                String savedFileName = fileUtil.extractFileNameFromPath(savedPath);

                // 4. 확장자 추출
                String extension = fileUtil.getExtension(file.getOriginalFilename());

                // 5. 엔티티 생성
                BoardFile boardFile = new BoardFile();
                boardFile.setBoard(saved); // 외래키 연관관계 설정
                boardFile.setFileName(savedFileName); // 실제 저장된 UUID 파일명
                boardFile.setOriginalFileName(file.getOriginalFilename()); // 사용자 업로드 이름
                boardFile.setFilePath(savedPath); // /files/board/...
                boardFile.setFileType(String.valueOf(board.getBoardType()));
                boardFile.setFileSize(file.getSize());
                //boardFile.setFileType(file.getContentType());
                boardFile.setFileExtension(extension);
                boardFile.setDispSeq(order++); // 순서 1, 2, 3...

                // 공통 기본값
                //boardFile.setRegAdm("SYSTEM"); // 실제 사용시 로그인 유저 정보 등으로 대체

                fileEntities.add(boardFile);
            }

            boardFileRepository.saveAll(fileEntities);
            System.out.println(" 첨부파일 저장 완료 (" + fileEntities.size() + "건)");
        } else {
            System.out.println("첨부파일 없음");
        }
    }

    @Transactional
    public void updateBoard(Long id, BoardRequest request, List<MultipartFile> files) {
        // 1. 게시글 조회 및 필드 업데이트
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글이 존재하지 않습니다."));

        board.setBoardType(BoardType.valueOf(request.getBoardType()));
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setWriterName(request.getWriterName());
        board.setUseTf(request.getUseTf());

        // ===== 공지 필드 반영 =====
        board.setNoticeTf(request.getNoticeTf());
        board.setNoticeSeq(request.getNoticeSeq());
        board.setNoticeStart(request.getNoticeStart()); // null 허용
        board.setNoticeEnd(request.getNoticeEnd()); // null 허용

        board.setUpDate(LocalDateTime.now());

        boardRepository.save(board);
        // 2. 기존 파일 유지 목록 추출
        List<Long> keepFileIds = request.getExistingFileIdList(); // "1,2,3" → [1,2,3]

        // 3. 기존 파일 중 삭제 대상 제거
        if (keepFileIds.isEmpty()) {
            boardFileRepository.deleteByBoardId(board.getId());
        } else {
            boardFileRepository.deleteByBoardIdAndIdNotIn(board.getId(), keepFileIds);
        }

        // 5. 새로 업로드된 첨부파일 저장
        if (files != null && !files.isEmpty()) {
            List<BoardFile> fileEntities = new ArrayList<>();
            int order = 1;

            for (MultipartFile file : files) {
                // 1. 저장 경로 계산
                Path basePath = fileUtil.resolveBoardPath(String.valueOf(board.getBoardType()));

                // 2. 파일 저장 → /files/board/... 경로 반환
                String savedPath = fileUtil.saveFile(basePath, file);

                // 3. UUID 기반 저장 파일명 추출
                String savedFileName = fileUtil.extractFileNameFromPath(savedPath);

                // 4. 확장자 추출
                String extension = fileUtil.getExtension(file.getOriginalFilename());

                // 5. 파일 엔티티 생성
                BoardFile boardFile = new BoardFile();
                boardFile.setBoard(board); // 외래키 연관관계 설정
                boardFile.setFileName(savedFileName); // 실제 저장된 파일명
                boardFile.setOriginalFileName(file.getOriginalFilename()); // 사용자 업로드명
                boardFile.setFilePath(savedPath); // /files/board/...
                boardFile.setFileType(String.valueOf(board.getBoardType()));
                boardFile.setFileSize(file.getSize());
                boardFile.setFileExtension(extension);
                boardFile.setDispSeq(order++);

                fileEntities.add(boardFile);
            }

            boardFileRepository.saveAll(fileEntities);
            System.out.println(" 신규 첨부파일 저장 완료 (" + fileEntities.size() + "건)");
        } else {
            System.out.println(" 신규 첨부파일 없음");
        }
    }

    @Transactional
    public void deleteBoard(Long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("게시글이 존재하지 않습니다."));

        board.setDelTf("Y");
        board.setDelDate(LocalDateTime.now());
        //board.setDelAdm("SYSTEM"); // 로그인 사용자 ID로 대체 가능

        boardRepository.save(board);

        System.out.println(" 게시글 소프트 삭제 완료 - ID: " + id);
    }


}
