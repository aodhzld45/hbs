package com.hbs.hsbbo.admin.sqlpractice.service;

import com.hbs.hsbbo.admin.sqlpractice.dto.SqlPreviewStubDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SqlPreviewService {
    public SqlPreviewStubDto.PreviewResult<Void> schema(SqlPreviewStubDto.PreviewSchemaReq req) {
        return new SqlPreviewStubDto.PreviewResult<>(true, "스키마 체크 OK (Service)", null, null);
    }

    public SqlPreviewStubDto.PreviewResult<String> run(SqlPreviewStubDto.PreviewRunReq req) {
        return new SqlPreviewStubDto.PreviewResult<>(true, "쿼리 실행 OK (Service)", "샘플 결과", null);
    }

    public SqlPreviewStubDto.PreviewResult<String> validate(SqlPreviewStubDto.PreviewValidateReq req) {
        return new SqlPreviewStubDto.PreviewResult<>(true, "테스트케이스 검증 OK (Service)", "샘플 리포트", null);
    }
}
