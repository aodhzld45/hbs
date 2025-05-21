package com.hbs.hsbbo.common.util;

import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@Resource
public class ExcelUtil {
    public static <T> ByteArrayInputStream generateExcel(
            List<T> data,
            List<String> headers,
            List<Function<T, String>> valueExtractors
    ){
        try(
            Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
        ) {
            Sheet sheet = workbook.createSheet("Sheet");
            // 헤더
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                headerRow.createCell(i).setCellValue(headers.get(i));
            }

            // 본문
            int rowIdx = 1;
            for (T item : data) {
                Row row = sheet.createRow(rowIdx++);
                for (int i = 0; i < valueExtractors.size(); i++) {
                    String value = valueExtractors.get(i).apply(item);
                    row.createCell(i).setCellValue(value);
                }
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("엑셀 생성 실패");
        }


    }


}
