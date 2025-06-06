package com.hbs.hsbbo.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ContentFileListResponse {
    private List<ContentFileResponse> items;
    private long totalCount;
    private int totalPages;
}
