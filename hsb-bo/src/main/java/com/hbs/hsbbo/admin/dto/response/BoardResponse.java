package com.hbs.hsbbo.admin.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class BoardResponse {

    private Integer id;
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

}
