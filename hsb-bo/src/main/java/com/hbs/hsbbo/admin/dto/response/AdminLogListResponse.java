package com.hbs.hsbbo.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminLogListResponse {
    private List<AdminLogResponse> items;
    private Long totalCount;
    private int totalPages;
}
