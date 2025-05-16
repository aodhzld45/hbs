package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.BoardFile;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class BoardFileResponse {
    private Long id;
    private Long boardId;

    private String fileName;
    private String originalFileName;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private String fileExtension;

    private Integer dispSeq;
    private String useTf;
    private String delTf;

    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static BoardFileResponse from(BoardFile file) {
        BoardFileResponse dto = new BoardFileResponse();
        dto.setId(file.getId());
        dto.setBoardId(file.getBoard().getId());
        dto.setFileName(file.getFileName());
        dto.setOriginalFileName(file.getOriginalFileName());
        dto.setFilePath(file.getFilePath());
        dto.setFileSize(file.getFileSize());
        dto.setFileType(file.getFileType());
        dto.setFileExtension(file.getFileExtension());
        dto.setDispSeq(file.getDispSeq());
        dto.setUseTf(file.getUseTf());
        dto.setDelTf(file.getDelTf());
        dto.setRegAdm(file.getRegAdm());
        dto.setRegDate(file.getRegDate());
        dto.setUpAdm(file.getUpAdm());
        dto.setUpDate(file.getUpDate());
        dto.setDelAdm(file.getDelAdm());
        dto.setDelDate(file.getDelDate());
        return dto;
    }

}
