package com.hbs.hsbbo.batch;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Component
public class XlsToCsv {
    public void convert(byte[] xlsBytes, File outCsv) throws Exception {
        if (xlsBytes == null || xlsBytes.length == 0) {
            throw new IllegalArgumentException("xlsBytes is null/empty");
        }
        try (InputStream in = new ByteArrayInputStream(xlsBytes);
             Workbook wb = WorkbookFactory.create(in);
             OutputStream os = new FileOutputStream(outCsv);
             OutputStreamWriter w = new OutputStreamWriter(os, StandardCharsets.UTF_8);
             BufferedWriter bw = new BufferedWriter(w)) {

            DataFormatter fmt = new DataFormatter();
            Sheet sh = wb.getSheetAt(0);
            for (Row row : sh) {
                StringBuilder sb = new StringBuilder();
                int last = Math.max(0, row.getLastCellNum());
                for (int c=0;c<last;c++){
                    if (c>0) sb.append(',');
                    Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String v = cell==null ? "" : fmt.formatCellValue(cell).trim();
                    if (v.contains(",") || v.contains("\"")) v = "\"" + v.replace("\"","\"\"") + "\"";
                    sb.append(v);
                }
                bw.write(sb.toString());
                bw.newLine();
            }
        }
    }
}
