package com.hbs.hsbbo.user.kis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockSearchDto {
    private String code;  // 종목코드
    private String name;  // 종목명
}
