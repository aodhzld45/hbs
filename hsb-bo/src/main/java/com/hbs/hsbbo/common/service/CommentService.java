package com.hbs.hsbbo.common.service;

import com.hbs.hsbbo.common.domain.entity.Comment;
import com.hbs.hsbbo.common.dto.request.CommentRequest;
import com.hbs.hsbbo.common.dto.response.CommentResponse;
import com.hbs.hsbbo.common.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    @Autowired
    private final CommentRepository commentRepository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    // 댓글 등록
    public CommentResponse createComment(CommentRequest request) {
        Comment comment = new Comment();
        comment.setTargetType(request.getTargetType());
        comment.setTargetId(request.getTargetId());
        comment.setParentId(request.getParentId());
        comment.setWriterName(request.getWriterName());
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        comment.setPassword(hashedPassword);
        comment.setContent(request.getContent());
        comment.setUseTf("Y");
        comment.setDelTf("N");
        comment.setRegDate(LocalDateTime.now());

        Comment saved = commentRepository.save(comment);
        return CommentResponse.from(saved);
    }

    // 특정 콘텐츠에 속한 댓글 전체 조회 (삭제되지 않은 것만)
    public List<CommentResponse> getComments(String targetType, Long targetId) {
        return commentRepository.findByTargetTypeAndTargetIdAndDelTfOrderByRegDateAsc(targetType, targetId, "N")
                .stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
    }

    // 댓글 단건 조회. (상세보기 or 테스트)
    public CommentResponse getComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        return CommentResponse.from(comment);
    }

    // 댓글 수정
    public CommentResponse updateComment(Long id, String newContent) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        comment.setContent(newContent);
        comment.setUpDate(LocalDateTime.now());

        return CommentResponse.from(commentRepository.save(comment));
    }

    // 댓글 삭제
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        comment.setDelTf("Y");
        comment.setUpDate(LocalDateTime.now());
        commentRepository.save(comment);
    }

    public boolean verifyPassword(Long id, String rawPassword) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("댓글 없음"));

        return passwordEncoder.matches(rawPassword, comment.getPassword());
    }
}
