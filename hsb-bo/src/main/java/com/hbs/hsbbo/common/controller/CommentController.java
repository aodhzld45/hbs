package com.hbs.hsbbo.common.controller;

import com.hbs.hsbbo.common.dto.request.CommentRequest;
import com.hbs.hsbbo.common.dto.response.CommentResponse;
import com.hbs.hsbbo.common.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    // 댓글 등록
    @PostMapping
    public ResponseEntity<CommentResponse> create(@RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.createComment(request));
    }

    // 특정 콘텐츠의 댓글 전체 조회
    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(
            @RequestParam String targetType,
            @RequestParam Long targetId
    ) {
        return ResponseEntity.ok(commentService.getComments(targetType, targetId));
    }

    // 댓글 비밀번호 검증
    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String password = body.get("password");
        boolean verified = commentService.verifyPassword(id, password);
        return ResponseEntity.ok(Map.of("verified", verified));
    }


    // 댓글 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> getComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getComment(id));
    }

    // 댓글 수정
    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @RequestBody String newContent
    ) {
        return ResponseEntity.ok(commentService.updateComment(id, newContent));
    }
    // 댓글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }

}
