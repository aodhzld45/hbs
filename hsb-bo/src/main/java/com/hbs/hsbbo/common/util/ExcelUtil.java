package com.hbs.hsbbo.common.util;

import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@Resource
public class ExcelUtil {
    // 엑셀 저장용
    public static <T> ByteArrayInputStream generateExcel(
            String sheetName,
            List<T> data,
            List<String> headers,
            List<Function<T, String>> valueExtractors
    ){
        try(
            Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
        ) {
            Sheet sheet = workbook.createSheet(sheetName);
            // 스타일 생성
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle cellStyle = createCellStyle(workbook);

            int colSize = headers.size();

            // 1. 타이틀
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(sheetName);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, colSize - 1));

            // 2. 출력일자
            Row dateRow = sheet.createRow(1);
            Cell dateCell = dateRow.createCell(0);
            dateCell.setCellValue("출력 일자 : [" + LocalDate.now() + "]");
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, colSize - 1));

            // 3. 헤더
            Row headerRow = sheet.createRow(2);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            // 4. 본문
            int rowIdx = 3;
            for (T item : data) {
                Row row = sheet.createRow(rowIdx++);
                for (int i = 0; i < valueExtractors.size(); i++) {
                    Cell cell = row.createCell(i);
                    cell.setCellValue(valueExtractors.get(i).apply(item));
                    cell.setCellStyle(cellStyle);
                }
            }

            // 5. 자동 너비 조정
            for (int i = 0; i < colSize; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("엑셀 생성 실패", e);
        }
    }

    // 엑셀 데이터 파싱
    public static List<Map<String, String>> parseExcel(InputStream is) {
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            List<Map<String, String>> result = new ArrayList<>();
            Row headerRow = sheet.getRow(2); // 헤더 row index

            if (headerRow == null) {
                return result;
            }

            int colCount = headerRow.getPhysicalNumberOfCells();
            List<String> headers = new ArrayList<>();
            for (int i = 0; i < colCount; i++) {
                Cell cell = headerRow.getCell(i);
                headers.add(cell != null ? cellToString(cell) : "");
            }

            for (int i = 3; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Map<String, String> rowData = new LinkedHashMap<>();
                for (int j = 0; j < colCount; j++) {
                    Cell cell = row.getCell(j);
                    String value = (cell != null) ? cellToString(cell) : "";
                    rowData.put(headers.get(j), value);
                }
                result.add(rowData);
            }

            return result;

        } catch (IOException e) {
            throw new RuntimeException("엑셀 파싱 실패", e);
        }
    }


    private static String cellToString(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double num = cell.getNumericCellValue();
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString(); // 필요 시 포맷팅
                } else {
                    if (num == Math.floor(num)) {
                        return String.valueOf((int) num);
                    } else {
                        return String.valueOf(num);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (IllegalStateException e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    private static CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private static CellStyle createCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}
