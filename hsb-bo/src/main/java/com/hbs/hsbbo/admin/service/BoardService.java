package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.Board;
import com.hbs.hsbbo.admin.domain.entity.BoardFile;
import com.hbs.hsbbo.admin.domain.type.BoardType;
import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.repository.BoardFileRepository;
import com.hbs.hsbbo.admin.repository.BoardRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class BoardService {
    @Autowired
    private final BoardRepository boardRepository;

    @Autowired
    private final BoardFileRepository boardFileRepository;

    @Autowired
    private final FileUtil fileUtil;

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
                String path = fileUtil.saveFile(
                        fileUtil.resolveBoardPath(String.valueOf(board.getBoardType())),
                        file
                );
                String extension = fileUtil.getExtension(file.getOriginalFilename());

                BoardFile boardFile = new BoardFile();
                boardFile.setBoard(saved); // 외래키 연관관계 설정
                boardFile.setFileName(file.getOriginalFilename());
                boardFile.setFilePath(path);
                boardFile.setFileType(String.valueOf(board.getBoardType()));
                boardFile.setFileSize(file.getSize());
                boardFile.setFileType(file.getContentType());
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
}
