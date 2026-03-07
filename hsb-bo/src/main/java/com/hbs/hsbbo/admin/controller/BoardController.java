package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.dto.request.BoardRequest;
import com.hbs.hsbbo.admin.dto.response.BoardListResponse;
import com.hbs.hsbbo.admin.dto.response.BoardResponse;
import com.hbs.hsbbo.admin.service.BoardService;
import com.hbs.hsbbo.common.util.ExcelUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
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

    private final BoardService boardService;

    @GetMapping("/board-list")
    public ResponseEntity<BoardListResponse> getBoardList(
            @RequestParam String boardCode,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String useTf
    ) {
        return ResponseEntity.ok(boardService.getBoardList(boardCode, keyword, page, size, useTf));
    }

    @GetMapping("/board-detail")
    public ResponseEntity<BoardResponse> getBoardDetail(
            @RequestParam Long id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletRequest request
    ) {
        boolean isAdmin = authorizationHeader != null && authorizationHeader.startsWith("Bearer ");
        BoardResponse response = isAdmin
                ? boardService.getBoardDetail(id)
                : boardService.getBoardDetailWithViewCount(id, request);
        return ResponseEntity.ok(response);
    }

    @AdminActionLog(action = "게시글 등록", detail = "")
    @PostMapping("/board-create")
    public ResponseEntity<String> createBoard(
            @ModelAttribute BoardRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        boardService.createBoard(request, files);
        return ResponseEntity.ok("등록 성공");
    }

    @AdminActionLog(action = "게시글 수정", detail = "id={id}")
    @PutMapping("/board-update/{id}")
    public ResponseEntity<String> updateBoard(
            @PathVariable Long id,
            @ModelAttribute BoardRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        boardService.updateBoard(id, request, files);
        return ResponseEntity.ok("수정 성공");
    }

    @AdminActionLog(action = "게시글 삭제", detail = "id={id}")
    @PutMapping("/board-delete/{id}")
    public ResponseEntity<String> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok("삭제 성공");
    }

    @AdminActionLog(action = "게시글 사용여부 변경", detail = "id={id}")
    @PutMapping("/use-tf/{id}")
    public ResponseEntity<Long> updateUseTf(
            @PathVariable Long id,
            @RequestParam String useTf,
            @RequestParam String adminId
    ) {
        return ResponseEntity.ok(boardService.updateUseTf(id, useTf, adminId));
    }

    @GetMapping("/export")
    public ResponseEntity<Resource> getBoardExcel(
            @RequestParam String boardCode,
            @RequestParam(required = false, defaultValue = "") String keyword
    ) {
        BoardListResponse response = boardService.getBoardList(boardCode, keyword, 0, 10000, null);
        List<BoardResponse> boards = response.getItems();
        String boardName = boards.stream()
                .map(BoardResponse::getBoardName)
                .filter(name -> name != null && !name.isBlank())
                .findFirst()
                .orElse(boardCode.toUpperCase());

        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String sheetName = boardName + " 목록";
        String title = "[" + boardName + "] 목록_" + today;

        List<String> headers = List.of("ID", "제목", "작성자", "등록일", "조회수", "노출여부");
        List<Function<BoardResponse, String>> extractors = List.of(
                b -> String.valueOf(b.getId()),
                BoardResponse::getTitle,
                b -> Optional.ofNullable(b.getWriterName()).orElse("-"),
                b -> b.getRegDate() != null ? b.getRegDate().toString() : "-",
                b -> String.valueOf(b.getViewCount()),
                b -> "Y".equals(b.getUseTf()) ? "사용" : "미사용"
        );

        ByteArrayInputStream excelStream = ExcelUtil.generateExcel(sheetName, boards, headers, extractors);
        String filename = URLEncoder.encode(title + ".xlsx", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(excelStream));
    }
}
