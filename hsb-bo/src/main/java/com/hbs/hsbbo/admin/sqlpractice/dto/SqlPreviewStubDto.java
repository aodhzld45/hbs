package com.hbs.hsbbo.admin.sqlpractice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

public class SqlPreviewStubDto {
    @Getter @Setter
    public class PreviewSchemaReq {
        private String ddlScript;
        private String seedScript;
    }

    @Getter @Setter
    public class PreviewRunReq {
        private String ddlScript;
        private String seedScript;
        private String answerSql;
    }

    @Getter @Setter
    public class PreviewValidateReq {
        private String ddlScript;
        private String seedScript;
        private List<Testcase> testcases;

        @Getter
        @Setter
        public static class Testcase {
            private String answerSql;
            private String expectedSql;
        }
    }

    @Getter @Setter @AllArgsConstructor
    @NoArgsConstructor
    public static class PreviewResult<T> {
        private boolean ok;
        private String message;
        private T data;
        private String errorDetail;
    }

}
