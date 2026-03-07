package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.BoardConfig;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class BoardConfigResponse {
    private Long id;
    private String boardCode;
    private String boardName;
    private String boardDesc;
    private String menuPath;
    private String skinType;
    private Integer listSize;
    private Integer sortSeq;
    private String commentTf;
    private String fileTf;
    private String noticeTf;
    private String thumbnailTf;
    private String periodTf;
    private String secretTf;
    private String replyTf;
    private String categoryTf;
    private String categoryMode;
    private String categoryJson;
    private String editorTf;
    private String readRole;
    private String writeRole;
    private String updateRole;
    private String deleteRole;
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static BoardConfigResponse from(BoardConfig entity) {
        return new BoardConfigResponse(
                entity.getId(),
                entity.getBoardCode(),
                entity.getBoardName(),
                entity.getBoardDesc(),
                entity.getMenuPath(),
                entity.getSkinType(),
                entity.getListSize(),
                entity.getSortSeq(),
                entity.getCommentTf(),
                entity.getFileTf(),
                entity.getNoticeTf(),
                entity.getThumbnailTf(),
                entity.getPeriodTf(),
                entity.getSecretTf(),
                entity.getReplyTf(),
                entity.getCategoryTf(),
                entity.getCategoryMode(),
                entity.getCategoryJson(),
                entity.getEditorTf(),
                entity.getReadRole(),
                entity.getWriteRole(),
                entity.getUpdateRole(),
                entity.getDeleteRole(),
                entity.getUseTf(),
                entity.getDelTf(),
                entity.getRegAdm(),
                entity.getRegDate(),
                entity.getUpAdm(),
                entity.getUpDate(),
                entity.getDelAdm(),
                entity.getDelDate()
        );
    }
}
