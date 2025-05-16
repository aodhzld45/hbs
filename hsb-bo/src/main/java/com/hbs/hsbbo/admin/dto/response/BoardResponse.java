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
    private String boardType;
    private String title;
    private String content;
    private String writerName;
    private String imagePath;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer viewCount;
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    private boolean hasFile; // 게시물 파일 유무 판단.

    private List<BoardFileResponse> files; // 실제 파일 목록 (상세 전용 필드 / 목록에서는 null 또는 빈 리스트)

    public static BoardResponse from(Board entity) {
        return new BoardResponse(
                entity.getId(),
                entity.getBoardType().name(),
                entity.getTitle(),
                entity.getContent(),
                entity.getWriterName(),
                entity.getImagePath(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getViewCount(),
                entity.getUseTf(),
                entity.getDelTf(),
                entity.getRegAdm(),
                entity.getRegDate(),
                entity.getUpAdm(),
                entity.getUpDate(),
                entity.getDelAdm(),
                entity.getDelDate(),
                false,           // hasFile 기본값
                null             // files 기본값
        );
    }


}
