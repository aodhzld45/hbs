package com.hbs.hsbbo.admin.sqlpractice.controller;

import com.hbs.hsbbo.admin.sqlpractice.dto.SqlPreviewStubDto;
import com.hbs.hsbbo.admin.sqlpractice.service.SqlPreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sql-preview")
@RequiredArgsConstructor
public class SqlPreviewController {

    private final SqlPreviewService sqlPreviewService;

    @PostMapping("/schema")
    public SqlPreviewStubDto.PreviewResult<Void> schema(@RequestBody SqlPreviewStubDto.PreviewSchemaReq req) {
        // TODO: 실제 로직 대신 스텁
        return sqlPreviewService.schema(req);
    }

    @PostMapping("/run")
    public SqlPreviewStubDto.PreviewResult<String> run(@RequestBody SqlPreviewStubDto.PreviewRunReq req) {
        // TODO: 실제 로직 대신 스텁
        return sqlPreviewService.run(req);
    }

    @PostMapping("/validate")
    public SqlPreviewStubDto.PreviewResult<String> validate(@RequestBody SqlPreviewStubDto.PreviewValidateReq req) {
        // TODO: 실제 로직 대신 스텁
        return sqlPreviewService.validate(req);
    }
}
