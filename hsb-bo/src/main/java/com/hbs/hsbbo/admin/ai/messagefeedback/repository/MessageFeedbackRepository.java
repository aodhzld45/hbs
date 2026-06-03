package com.hbs.hsbbo.admin.ai.messagefeedback.repository;

import com.hbs.hsbbo.admin.ai.messagefeedback.domain.entity.MessageFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
