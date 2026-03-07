package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.Board;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class BoardResponse {

    private Long id;
    private Long boardConfigId;
    private String boardCode;
    private String boardName;
    private String categoryCode;
    private String title;
    private String content;
    private String writerName;
    private String imagePath;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer viewCount;
    private String noticeTf;
    private int noticeSeq;
    private LocalDateTime noticeStart;
    private LocalDateTime noticeEnd;
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;
    private boolean hasFile;
    private List<BoardFileResponse> files;

    public static BoardResponse from(Board entity) {
        return new BoardResponse(
                entity.getId(),
                entity.getBoardConfig() != null ? entity.getBoardConfig().getId() : null,
                entity.getBoardConfig() != null ? entity.getBoardConfig().getBoardCode() : null,
                entity.getBoardConfig() != null ? entity.getBoardConfig().getBoardName() : null,
                entity.getCategoryCode(),
                entity.getTitle(),
                entity.getContent(),
                entity.getWriterName(),
                entity.getImagePath(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getViewCount(),
                entity.getNoticeTf(),
                entity.getNoticeSeq(),
                entity.getNoticeStart(),
                entity.getNoticeEnd(),
                entity.getUseTf(),
                entity.getDelTf(),
                entity.getRegAdm(),
                entity.getRegDate(),
                entity.getUpAdm(),
                entity.getUpDate(),
                entity.getDelAdm(),
                entity.getDelDate(),
                false,
                null
        );
    }
}
