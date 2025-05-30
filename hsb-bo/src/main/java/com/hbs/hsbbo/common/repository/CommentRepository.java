package com.hbs.hsbbo.common.repository;


import com.hbs.hsbbo.common.domain.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 특정 대상(targetType + targetId)의 모든 댓글 + 대댓글 조회
    List<Comment> findByTargetTypeAndTargetIdAndDelTfOrderByRegDateAsc(String targetType, Long targetId, String delTf);

    // 부모 댓글에 해당하는 대댓글 목록 조회
    List<Comment> findByParentIdAndDelTfOrderByRegDateAsc(Long parentId, String delTf);
}
