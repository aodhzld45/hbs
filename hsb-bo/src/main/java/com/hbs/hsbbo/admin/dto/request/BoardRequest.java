package com.hbs.hsbbo.admin.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
public class BoardRequest {
    private String boardType;
    private String title;
    private String content;
    private String writerName;
    private String useTf;
    private String existingFileIds; // "1,2,3"

    private String noticeTf;      // "Y" or "N"
    private Integer noticeSeq;    // 우선순위 (기본 0)
    private LocalDateTime noticeStart; // 공지 시작일
    private LocalDateTime noticeEnd; // 공지 만료일


    public List<Long> getExistingFileIdList() {
        if (existingFileIds == null || existingFileIds.isBlank()) return Collections.emptyList();
        return Arrays.stream(existingFileIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }
}
