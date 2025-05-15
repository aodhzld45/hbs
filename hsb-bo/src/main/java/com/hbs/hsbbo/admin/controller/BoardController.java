package com.hbs.hsbbo.admin.controller;


import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardController {

    @Autowired
    private final BoardService boardService;

    @PostMapping("/board-create")
    public ResponseEntity<?> createBoard(
            @ModelAttribute BoardRequest request,
            @RequestPart(value = "files", required = false)List<MultipartFile> files
            ) {

        try {
            boardService.createBoard(request, files);
            return ResponseEntity.ok("등록이 성공했습니다.");

        } catch (Exception e) {
            e.printStackTrace(); // 콘솔 확인용 로그
            return ResponseEntity
                    .status(500)
                    .body("등록에 실패했습니다. ");
        }

//        System.out.println("요청 처리 정보: " + request.toString());

//        if (files != null && !files.isEmpty()) {
//            System.out.println("📎 첨부파일 목록:");
//            files.forEach(file -> {
//                System.out.println(" - 파일명: " + file.getOriginalFilename());
//                System.out.println("   사이즈: " + file.getSize() + " bytes");
//                System.out.println("   ContentType: " + file.getContentType());
//            });
//        } else {
//            System.out.println("📎 첨부파일 없음");
//        }
    }



}
