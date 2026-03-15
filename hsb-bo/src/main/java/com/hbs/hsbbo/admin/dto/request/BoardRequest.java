package com.hbs.hsbbo.admin.dto.request;

import com.hbs.hsbbo.admin.aop.LogExclude;
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
    private String boardCode;
    private String categoryCode;
    private String title;
    @LogExclude
    private String content;
    private String writerName;
    private String imagePath;
    private String useTf;
    private String existingFileIds;

    private String noticeTf;
    private Integer noticeSeq;
    private LocalDateTime noticeStart;
    private LocalDateTime noticeEnd;

    public List<Long> getExistingFileIdList() {
        if (existingFileIds == null || existingFileIds.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(existingFileIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }
}
