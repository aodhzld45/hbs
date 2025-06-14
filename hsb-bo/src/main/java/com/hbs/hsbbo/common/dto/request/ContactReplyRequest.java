package com.hbs.hsbbo.common.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContactReplyRequest {
    private Long id;             // 문의글 ID
    private String replyContent; // 답변 내용
    private String replyMethod;  // EMAIL or PHONE
}
