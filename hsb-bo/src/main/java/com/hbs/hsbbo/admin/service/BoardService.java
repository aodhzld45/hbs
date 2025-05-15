package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.Board;
import com.hbs.hsbbo.admin.domain.type.BoardType;
import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.repository.BoardFileRepository;
import com.hbs.hsbbo.admin.repository.BoardRepository;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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


        if (files != null && !files.isEmpty()) {
            System.out.println("📎 첨부파일 목록:");
            files.forEach(file -> {
                String path = fileUtil.saveFile(fileUtil.resolveBoardPath(String.valueOf(board.getBoardType())), file);
                String extension = fileUtil.getExtension(file.getOriginalFilename());

                System.out.println(" - 파일명: " + file.getOriginalFilename());
                System.out.println("   사이즈: " + file.getSize() + " bytes");
                System.out.println("   경로 값: " + path);
                System.out.println("   확장자: " + extension);

                System.out.println("   ContentType: " + file.getContentType());
            });
        } else {
            System.out.println("📎 첨부파일 없음");
        }

//        boardRepository.save(board);
//        Board saved = boardRepository.save(board);
//        System.out.println("저장된 ID: " + saved.getId());


        // 2. 파일 저장
//        if (files != null && !files.isEmpty()) {
//            List<BoardFile> fileEntities = new ArrayList<>();
//            for (MultipartFile file : files) {
//                String path = fileUtil.saveFile(fileUtil.resolveBoardPath(String.valueOf(board.getBoardType())), file);
//                BoardFile boardFile = new BoardFile();
//                boardFile.setBoard(board);
//                boardFile.setFilePath(path);
//                boardFile.setFileName(file.getOriginalFilename());
//                boardFile.setFileExtension(fileUtil.getExtension(file.getOriginalFilename()));
//                fileEntities.add(boardFile);
//            }
//            boardFileRepository.saveAll(fileEntities);
//        }

    }



}
