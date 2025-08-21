package com.hbs.hsbbo.admin.sqlpractice.dto.response;

public record SqlTcDto(
        Long id,
        String name,
        String visibility,        // "PUBLIC" | "HIDDEN"
        String expectedMode,      // "RESULT_SET" ...
        String expectedSql,
        Integer expectedRows,
        String assertSql,
        String expectedMetaJson,
        Boolean orderSensitiveOverride,
        String seedOverride,
        String noteMd,
        Integer sortNo
) {}
