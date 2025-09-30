package com.hbs.hsbbo.admin.controller;


import com.hbs.hsbbo.admin.domain.type.BoardType;
import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.dto.response.BoardListResponse;
import com.hbs.hsbbo.admin.dto.response.BoardResponse;
import com.hbs.hsbbo.admin.service.BoardService;
import com.hbs.hsbbo.common.util.ExcelUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardController {

    @Autowired
    private final BoardService boardService;

    @GetMapping("/board-list")
    public ResponseEntity<BoardListResponse> getBoardList(
            @RequestParam BoardType type,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String useTf // <- 사용자면 "Y", 관리자면 생략

    ) {
        BoardListResponse result = boardService.getBoardList(type, keyword, page, size, useTf);


        return ResponseEntity.ok(result);
    }

    //  상세 조회 API
    @GetMapping("/board-detail")
    public ResponseEntity<BoardResponse> getBoardDetail(
            @RequestParam Long id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletRequest request
    ) {
        // JWT 토큰이 없다면 일반 사용자라고 판단
        boolean isAdmin = (authorizationHeader != null && authorizationHeader.startsWith("Bearer "));

        BoardResponse response = isAdmin
                ? boardService.getBoardDetail(id) // 관리자: 조회수 증가 없음
                : boardService.getBoardDetailWithViewCount(id, request); // 사용자: 조회수 증가 포함

        return ResponseEntity.ok(response);
    }

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
//            System.out.println(" 첨부파일 목록:");
//            files.forEach(file -> {
//                System.out.println(" - 파일명: " + file.getOriginalFilename());
//                System.out.println("   사이즈: " + file.getSize() + " bytes");
//                System.out.println("   ContentType: " + file.getContentType());
//            });
//        } else {
//            System.out.println(" 첨부파일 없음");
//        }
    }
    @PutMapping("/board-update/{id}")
    public ResponseEntity<?> updateBoard(
            @PathVariable Long id,
            @ModelAttribute BoardRequest request,
            @RequestPart(value = "files", required = false)List<MultipartFile> files
    ) {
//        System.out.println("요청 정보 id = " + id);
//        System.out.println("요청 정보" +  request.toString());
//
//        if (files != null && !files.isEmpty()) {
//            System.out.println("첨부파일 목록:");
//            files.forEach(file -> {
//                System.out.println(" - 파일명: " + file.getOriginalFilename());
//                System.out.println("   사이즈: " + file.getSize() + " bytes");
//                System.out.println("   ContentType: " + file.getContentType());
//            });
//        } else {
//            System.out.println("첨부파일 없음");
//        }

        try {
            boardService.updateBoard(id, request, files);
            return ResponseEntity.ok("수정 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("수정 실패");
        }
    }

    @PutMapping("/board-delete/{id}")
    public ResponseEntity<?> deleteBoard(@PathVariable Long id) {
        try {
            boardService.deleteBoard(id);
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 실패");
        }
    }

    @PutMapping("/use-tf/{id}")
    public ResponseEntity<Long> updateUseTf(
            @PathVariable Long id,
            @RequestParam String useTf,
            @RequestParam String adminId
    ) {
        Long response = boardService.updateUseTf(id, useTf, adminId);

        return ResponseEntity.ok(response);

    }

    @GetMapping("/export")
    public ResponseEntity<Resource> getBoardExcel(
            @RequestParam BoardType type,
            @RequestParam(required = false) String keyword
    ){
        BoardListResponse response = boardService.getBoardList(type, keyword, 0, 10, null);

        List<BoardResponse> boards = response.getItems();

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String sheetName = type.getDisplayName() + " 리스트";
        String title = "[" + type.getDisplayName() + "] 리스트_" + today;

        List<String> headers = List.of("ID", "제목", "작성자", "등록일", "조회수", "노출여부");
        List<Function<BoardResponse, String>> extractors = List.of(
                b -> String.valueOf(b.getId()),
                BoardResponse::getTitle,
                b -> Optional.ofNullable(b.getWriterName()).orElse("-"),
                b -> b.getRegDate().toString(),
                b -> String.valueOf(b.getViewCount()),
                b -> "Y".equals(b.getUseTf()) ? "보이기" : "숨김"
        );


        ByteArrayInputStream excelStream = ExcelUtil.generateExcel(sheetName, boards, headers, extractors);
        String filename = URLEncoder.encode(title + ".xlsx", StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(excelStream));
    }
}