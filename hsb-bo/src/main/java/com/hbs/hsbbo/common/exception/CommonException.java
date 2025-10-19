package com.hbs.hsbbo.common.exception;

public final class CommonException {
    private CommonException() {}

    /* ---------- 유틸 ---------- */
    private static String fmt(String message, Object... args) {
        return (args == null || args.length == 0) ? message : String.format(message, args);
    }

    /* ---------- 400 ---------- */
    public static class BadRequestException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        public BadRequestException(String message) { super(message); }
        public BadRequestException(String message, Object... args) { super(fmt(message, args)); }
        public BadRequestException(Throwable cause) { super(cause); }
        public BadRequestException(String message, Throwable cause) { super(message, cause); }
    }

    /* ---------- 401 ---------- */
    public static class UnauthorizedException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        public UnauthorizedException(String message) { super(message); }
        public UnauthorizedException(String message, Object... args) { super(fmt(message, args)); }
        public UnauthorizedException(Throwable cause) { super(cause); }
        public UnauthorizedException(String message, Throwable cause) { super(message, cause); }
    }

    /* ---------- 403 ---------- */
    public static class ForbiddenException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        public ForbiddenException(String message) { super(message); }
        public ForbiddenException(String message, Object... args) { super(fmt(message, args)); }
        public ForbiddenException(Throwable cause) { super(cause); }
        public ForbiddenException(String message, Throwable cause) { super(message, cause); }
    }

    /* ---------- 404 ---------- */
    public static class NotFoundException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        public NotFoundException(String message) { super(message); }
        public NotFoundException(String message, Object... args) { super(fmt(message, args)); }
        public NotFoundException(Throwable cause) { super(cause); }
        public NotFoundException(String message, Throwable cause) { super(message, cause); }
    }

    /* ---------- 409 ---------- */
    public static class ConflictException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        public ConflictException(String message) { super(message); }
        public ConflictException(String message, Object... args) { super(fmt(message, args)); }
        public ConflictException(Throwable cause) { super(cause); }
        public ConflictException(String message, Throwable cause) { super(message, cause); }
    }

    /* ---------- 429 ---------- */
    public static class TooManyRequestsException extends RuntimeException {
        private static final long serialVersionUID = 1L;
        public TooManyRequestsException(String message) { super(message); }
        public TooManyRequestsException(String message, Object... args) { super(fmt(message, args)); }
        public TooManyRequestsException(Throwable cause) { super(cause); }
        public TooManyRequestsException(String message, Throwable cause) { super(message, cause); }
    }
}
