package com.hbs.hsbbo.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ContactListResponse {
    private List<ContactResponse> items;
    private long totalCount;
    private int totalPages;
}
