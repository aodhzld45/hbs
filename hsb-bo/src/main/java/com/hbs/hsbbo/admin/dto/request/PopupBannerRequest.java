package com.hbs.hsbbo.admin.dto.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopupBannerRequest {

    private String title;
    private String type;
    private String linkUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String useTf;

    private MultipartFile file; // 업로드용
}
