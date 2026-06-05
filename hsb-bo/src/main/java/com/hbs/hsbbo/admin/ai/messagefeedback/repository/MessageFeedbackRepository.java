package com.hbs.hsbbo.admin.ai.messagefeedback.repository;

import com.hbs.hsbbo.admin.ai.messagefeedback.domain.entity.MessageFeedback;
import com.hbs.hsbbo.admin.ai.messagefeedback.domain.type.MessageFeedbackType;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackTopQuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MessageFeedbackRepository extends JpaRepository<MessageFeedback, Long> {

    @Query("""
           SELECT f FROM MessageFeedback f
            WHERE f.delTf = 'N'
              AND f.siteKeyValue = :siteKey
              AND f.messageId = :messageId
           """)
    Optional<MessageFeedback> findActiveBySiteKeyAndMessageId(
            @Param("siteKey") String siteKey,
            @Param("messageId") String messageId
    );

    @Query(
            value = """
                    SELECT f FROM MessageFeedback f
                     LEFT JOIN FETCH f.siteKey
                     LEFT JOIN FETCH f.usageLog
                     WHERE f.delTf = 'N'
                       AND (:tenantId IS NULL OR f.tenantId = :tenantId)
                       AND (:siteKeyId IS NULL OR f.siteKey.id = :siteKeyId)
                       AND (:feedbackType IS NULL OR f.feedbackType = :feedbackType)
                       AND (:clientHost IS NULL OR LOWER(f.clientHost) LIKE LOWER(CONCAT('%', :clientHost, '%')))
                       AND (:keyword IS NULL OR LOWER(f.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(f.answerText) LIKE LOWER(CONCAT('%', :keyword, '%')))
                       AND (:fromDateTime IS NULL OR f.regDate >= :fromDateTime)
                       AND (:toDateTime IS NULL OR f.regDate < :toDateTime)
                    """,
            countQuery = """
                    SELECT COUNT(f) FROM MessageFeedback f
                     WHERE f.delTf = 'N'
                       AND (:tenantId IS NULL OR f.tenantId = :tenantId)
                       AND (:siteKeyId IS NULL OR f.siteKey.id = :siteKeyId)
                       AND (:feedbackType IS NULL OR f.feedbackType = :feedbackType)
                       AND (:clientHost IS NULL OR LOWER(f.clientHost) LIKE LOWER(CONCAT('%', :clientHost, '%')))
                       AND (:keyword IS NULL OR LOWER(f.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(f.answerText) LIKE LOWER(CONCAT('%', :keyword, '%')))
                       AND (:fromDateTime IS NULL OR f.regDate >= :fromDateTime)
                       AND (:toDateTime IS NULL OR f.regDate < :toDateTime)
                    """
    )
    Page<MessageFeedback> searchAdmin(
            @Param("tenantId") String tenantId,
            @Param("siteKeyId") Long siteKeyId,
            @Param("feedbackType") MessageFeedbackType feedbackType,
            @Param("keyword") String keyword,
            @Param("clientHost") String clientHost,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime,
            Pageable pageable
    );

    @Query("""
           SELECT COUNT(f) FROM MessageFeedback f
            WHERE f.delTf = 'N'
              AND (:tenantId IS NULL OR f.tenantId = :tenantId)
              AND (:siteKeyId IS NULL OR f.siteKey.id = :siteKeyId)
              AND (:feedbackType IS NULL OR f.feedbackType = :feedbackType)
              AND (:clientHost IS NULL OR LOWER(f.clientHost) LIKE LOWER(CONCAT('%', :clientHost, '%')))
              AND (:keyword IS NULL OR LOWER(f.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(f.answerText) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:fromDateTime IS NULL OR f.regDate >= :fromDateTime)
              AND (:toDateTime IS NULL OR f.regDate < :toDateTime)
           """)
    long countAdmin(
            @Param("tenantId") String tenantId,
            @Param("siteKeyId") Long siteKeyId,
            @Param("feedbackType") MessageFeedbackType feedbackType,
            @Param("keyword") String keyword,
            @Param("clientHost") String clientHost,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );

    @Query("""
           SELECT COUNT(f) FROM MessageFeedback f
            WHERE f.delTf = 'N'
              AND f.feedbackType = :dislikeType
              AND f.regDate >= :recentFrom
              AND (:tenantId IS NULL OR f.tenantId = :tenantId)
              AND (:siteKeyId IS NULL OR f.siteKey.id = :siteKeyId)
              AND (:clientHost IS NULL OR LOWER(f.clientHost) LIKE LOWER(CONCAT('%', :clientHost, '%')))
              AND (:keyword IS NULL OR LOWER(f.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(f.answerText) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:fromDateTime IS NULL OR f.regDate >= :fromDateTime)
              AND (:toDateTime IS NULL OR f.regDate < :toDateTime)
           """)
    long countRecentDislikes(
            @Param("tenantId") String tenantId,
            @Param("siteKeyId") Long siteKeyId,
            @Param("keyword") String keyword,
            @Param("clientHost") String clientHost,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime,
            @Param("recentFrom") LocalDateTime recentFrom,
            @Param("dislikeType") MessageFeedbackType dislikeType
    );

    @Query("""
           SELECT new com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackTopQuestionResponse(
                    f.questionText,
                    MAX(f.answerText),
                    COUNT(f),
                    MAX(f.regDate)
                  )
             FROM MessageFeedback f
            WHERE f.delTf = 'N'
              AND f.feedbackType = :dislikeType
              AND (:tenantId IS NULL OR f.tenantId = :tenantId)
              AND (:siteKeyId IS NULL OR f.siteKey.id = :siteKeyId)
              AND (:clientHost IS NULL OR LOWER(f.clientHost) LIKE LOWER(CONCAT('%', :clientHost, '%')))
              AND (:keyword IS NULL OR LOWER(f.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(f.answerText) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:fromDateTime IS NULL OR f.regDate >= :fromDateTime)
              AND (:toDateTime IS NULL OR f.regDate < :toDateTime)
            GROUP BY f.questionText
            ORDER BY COUNT(f) DESC, MAX(f.regDate) DESC
           """)
    List<MessageFeedbackTopQuestionResponse> findTopDislikedQuestions(
            @Param("tenantId") String tenantId,
            @Param("siteKeyId") Long siteKeyId,
            @Param("keyword") String keyword,
            @Param("clientHost") String clientHost,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime,
            @Param("dislikeType") MessageFeedbackType dislikeType,
            Pageable pageable
    );
}
