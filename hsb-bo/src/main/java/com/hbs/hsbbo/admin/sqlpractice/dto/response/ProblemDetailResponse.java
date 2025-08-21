package com.hbs.hsbbo.admin.sqlpractice.dto.response;

import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;

import java.util.List;

// dto/ProblemDetailResponse.java
public record ProblemDetailResponse(
        Long id,
        String title,
        Integer level,
        List<String> tags,
        String descriptionMd,
        ConstraintRule constraintRule,
        boolean orderSensitive,
        String useTf,
        SqlSchemaDto schema,
        List<SqlTcDto> testcases
) {}


