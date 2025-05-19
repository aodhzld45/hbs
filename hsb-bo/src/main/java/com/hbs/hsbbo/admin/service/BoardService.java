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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class BoardService {
    @Autowired
    private final BoardRepository boardRepository;

    @Autowired
    private final BoardFileRepository boardFileRepository;

    @Autowired
    private final FileUtil fileUtil;

    public BoardListResponse getBoardList(BoardType boardType, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        // 게시글 목록 조회
        Page<Board> boardPage = boardRepository.findByBoardTypeAndKeyword(boardType, keyword, pageable);
        List<Board> boards = boardPage.getContent();
        List<Long> boardIds = boards.stream().map(Board::getId).toList();

        // 파일 유무 조회
        Map<Long, Boolean> fileMap = boardFileRepository.existsByBoardIds(boardIds);

        // Entity → DTO + hasFile 적용
        List<BoardResponse> items = boards.stream()
                .map(board -> {
                    BoardResponse dto = BoardResponse.from(board);
                    dto.setHasFile(fileMap.getOrDefault(board.getId(), false));
                    return dto;
                })
                .toList();

        return new BoardListResponse(items, boardPage.getTotalElements(), boardPage.getTotalPages());
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

    public void createBoard(BoardRequest request, List<MultipartFile> files) {
        // 1. 게시글 저장
        Board board = new Board();
        board.setBoardType(BoardType.valueOf(request.getBoardType()));
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setWriterName(request.getWriterName());
        board.setUseTf(request.getUseTf());

        Board saved = boardRepository.save(board);
        System.out.println("저장된 게시글 ID: " + saved.getId());

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

        //board.setUpAdm("admin01"); // 실제 로그인한 관리자 아이디로 대체
        board.setUpDate(LocalDateTime.now());

        boardRepository.save(board);
        System.out.println("수정된 게시글 ID: " + board.getId());

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

}
