package com.hbs.hsbbo.admin.dto.response.page;

import com.hbs.hsbbo.admin.domain.entity.page.PageSectionFile;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class PageSectionFileResponse {
    private Long id;
    private Long sectionId;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private String fileExtension;

    private Integer orderSeq;
    private String useTf;
    private String delTf;

    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static PageSectionFileResponse from(PageSectionFile file) {
        PageSectionFileResponse dto = new PageSectionFileResponse();
        dto.setId(file.getId());
        dto.setSectionId(file.getSection().getId());
        dto.setFileName(file.getFileName());
        dto.setOriginalFileName(file.getOriginalFileName());
        dto.setFilePath(file.getFilePath());
        dto.setFileSize(file.getFileSize());
        dto.setFileType(file.getFileType());
        dto.setFileExtension(file.getFileExtension());
        dto.setOrderSeq(file.getOrderSeq());
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
