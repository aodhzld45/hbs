package com.hbs.hsbbo.user.kis.dto;

import com.hbs.hsbbo.user.kis.domain.entity.StockMaster;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class StockMasterResponse {

    private Long id;             // PK
    private String isin;         // ISIN 코드
    private String symbol;         // 종목코드 (symbol)
    private String name;         // 종목명 (정식명)
    private String shortName;    // 약식명
    private String engName;      // 영문명
    private LocalDate listedDate;// 상장일
    private String market;       // 시장 (KOSPI/KOSDAQ 등)
    private String secType; // 유가증권 종류 (주권, ETF 등)
    private String sector;       // 소속부 (중견기업부 등)
    private String stockType;   // 주식종류 (보통주, 우선주 등)
    private Integer parValue;    // 액면가
    private Long listedShares;   // 상장주식수

    // 공통 관리 필드
    private String useTf;           // 사용여부 (Y/N)
    private String delTf;           // 삭제여부 (Y/N)
    private String regAdm;          // 등록자
    private LocalDateTime regDate;  // 등록일
    private String upAdm;           // 수정자
    private LocalDateTime upDate;   // 수정일
    private String delAdm;          // 삭제자
    private LocalDateTime delDate;  // 삭제일

    public static StockMasterResponse fromEntity(StockMaster entity) {
        if (entity == null) {
            return null;
        }

        StockMasterResponse response = new StockMasterResponse();
        response.setId(entity.getId());
        response.setIsin(entity.getIsin());
        response.setSymbol(entity.getSymbol());   // 종목코드
        response.setName(entity.getName());     // 정식명
        response.setShortName(entity.getShortName());
        response.setEngName(entity.getEngName());
        response.setListedDate(entity.getListedDate());
        response.setMarket(entity.getMarket());
        response.setSecType(entity.getSecType());
        response.setSector(entity.getSector());
        response.setStockType(entity.getStockType());
        response.setParValue(entity.getParValue());
        response.setListedShares(entity.getListedShares());

        // 공통 관리 필드
        response.setUseTf(entity.getUseTf());
        response.setDelTf(entity.getDelTf());
        response.setRegAdm(entity.getRegAdm());
        response.setRegDate(entity.getRegDate());
        response.setUpAdm(entity.getUpAdm());
        response.setUpDate(entity.getUpDate());
        response.setDelAdm(entity.getDelAdm());
        response.setDelDate(entity.getDelDate());

        return response;
    }

}
