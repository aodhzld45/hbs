package com.hbs.hsbbo.admin.ai.messagefeedback.service;

import com.hbs.hsbbo.admin.ai.messagefeedback.domain.entity.MessageFeedback;
import com.hbs.hsbbo.admin.ai.messagefeedback.domain.type.MessageFeedbackType;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.request.MessageFeedbackQuery;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackListResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackSummaryResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackTopQuestionResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.repository.MessageFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageFeedbackAdminService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final MessageFeedbackRepository repository;

    public MessageFeedbackListResponse search(MessageFeedbackQuery query) {
        NormalizedQuery q = normalize(query);
        Pageable pageable = PageRequest.of(q.page(), q.size(), parseSort(query.getSort()));

        Page<MessageFeedback> page = repository.searchAdmin(
                q.tenantId(),
                q.siteKeyId(),
                q.feedbackType(),
                q.keyword(),
                q.clientHost(),
                q.fromDateTime(),
                q.toDateTime(),
                pageable
        );

        List<MessageFeedbackResponse> items = page.getContent().stream()
                .map(MessageFeedbackResponse::from)
                .toList();

        return MessageFeedbackListResponse.of(items, page.getTotalElements(), page.getTotalPages());
    }

    public MessageFeedbackSummaryResponse summary(MessageFeedbackQuery query) {
        NormalizedQuery q = normalize(query);

        long total = repository.countAdmin(
                q.tenantId(), q.siteKeyId(), q.feedbackType(), q.keyword(), q.clientHost(), q.fromDateTime(), q.toDateTime()
        );
        long like = q.feedbackType() == MessageFeedbackType.DISLIKE ? 0 : repository.countAdmin(
                q.tenantId(), q.siteKeyId(), MessageFeedbackType.LIKE, q.keyword(), q.clientHost(), q.fromDateTime(), q.toDateTime()
        );
        long dislike = q.feedbackType() == MessageFeedbackType.LIKE ? 0 : repository.countAdmin(
                q.tenantId(), q.siteKeyId(), MessageFeedbackType.DISLIKE, q.keyword(), q.clientHost(), q.fromDateTime(), q.toDateTime()
        );
        long recent24hDislike = q.feedbackType() == MessageFeedbackType.LIKE ? 0 : repository.countRecentDislikes(
                q.tenantId(),
                q.siteKeyId(),
                q.keyword(),
                q.clientHost(),
                q.fromDateTime(),
                q.toDateTime(),
                LocalDateTime.now().minusHours(24),
                MessageFeedbackType.DISLIKE
        );

        double dislikeRate = total <= 0 ? 0.0 : Math.round((dislike * 1000.0 / total)) / 10.0;

        return MessageFeedbackSummaryResponse.builder()
                .totalCount(total)
                .likeCount(like)
                .dislikeCount(dislike)
                .dislikeRate(dislikeRate)
                .recent24hDislikeCount(recent24hDislike)
                .build();
    }

    public List<MessageFeedbackTopQuestionResponse> topDisliked(MessageFeedbackQuery query) {
        NormalizedQuery q = normalize(query);
        return repository.findTopDislikedQuestions(
                q.tenantId(),
                q.siteKeyId(),
                q.keyword(),
                q.clientHost(),
                q.fromDateTime(),
                q.toDateTime(),
                MessageFeedbackType.DISLIKE,
                PageRequest.of(0, 10)
        );
    }

    private NormalizedQuery normalize(MessageFeedbackQuery query) {
        int page = Math.max(query.getPage() == null ? 0 : query.getPage(), 0);
        int size = query.getSize() == null ? DEFAULT_PAGE_SIZE : query.getSize();
        size = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        LocalDateTime from = query.getFromDate() == null ? null : query.getFromDate().atStartOfDay();
        LocalDateTime to = query.getToDate() == null ? null : query.getToDate().plusDays(1).atStartOfDay();

        return new NormalizedQuery(
                blankToNull(query.getTenantId()),
                query.getSiteKeyId(),
                parseFeedbackType(query.getFeedbackType()),
                blankToNull(query.getKeyword()),
                blankToNull(query.getClientHost()),
                from,
                to,
                page,
                size
        );
    }

    private MessageFeedbackType parseFeedbackType(String value) {
        String normalized = blankToNull(value);
        if (normalized == null) {
            return null;
        }
        return MessageFeedbackType.valueOf(normalized.toUpperCase());
    }

    private Sort parseSort(String value) {
        String sortValue = blankToNull(value);
        if (sortValue == null) {
            return Sort.by(Sort.Direction.DESC, "regDate");
        }

        String[] parts = sortValue.split(",");
        String property = parts.length > 0 && !parts[0].isBlank() ? parts[0].trim() : "regDate";
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        if (!List.of("regDate", "upDate", "feedbackType", "siteKeyValue", "clientHost").contains(property)) {
            property = "regDate";
        }
        return Sort.by(direction, property);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private record NormalizedQuery(
            String tenantId,
            Long siteKeyId,
            MessageFeedbackType feedbackType,
            String keyword,
            String clientHost,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTime,
            int page,
            int size
    ) {
    }
}
