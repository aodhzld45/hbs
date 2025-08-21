package com.hbs.hsbbo.admin.sqlpractice.dto.response;

public record SqlSchemaDto(
        String ddlScript,
        String seedScript
) {}
