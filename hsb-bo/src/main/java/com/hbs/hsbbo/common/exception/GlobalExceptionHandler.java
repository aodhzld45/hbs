package com.hbs.hsbbo.common.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.hbs.hsbbo.common.exception.CommonException.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    public record ErrorResponse(String code, String message) {}

    @ExceptionHandler(BadRequestException.class)           // 400
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBadRequest(BadRequestException ex) {
        return new ErrorResponse("BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)      // 400
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleIllegalArg(IllegalArgumentException ex) {
        return new ErrorResponse("BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler({
            org.springframework.web.bind.MissingRequestHeaderException.class,
            org.springframework.web.bind.MissingServletRequestParameterException.class,
            org.springframework.http.converter.HttpMessageNotReadableException.class
    })                                                    // 400
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleMissing(Exception ex) {
        return new ErrorResponse("BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class) // 405
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ErrorResponse handleMethodNotAllowed(Exception ex) {
        return new ErrorResponse("METHOD_NOT_ALLOWED", ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)             // 404
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException ex) {
        return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)             // 409
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleConflict(ConflictException ex) {
        return new ErrorResponse("CONFLICT", ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)            // 403
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleForbidden(ForbiddenException ex) {
        return new ErrorResponse("FORBIDDEN", ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)         // 401
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleUnauthorized(UnauthorizedException ex) {
        return new ErrorResponse("UNAUTHORIZED", ex.getMessage());
    }

    @ExceptionHandler(TooManyRequestsException.class)      // 429
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ErrorResponse handleTooMany(TooManyRequestsException ex) {
        return new ErrorResponse("TOO_MANY_REQUESTS", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)                     // 500
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleUnknown(Exception ex) {
        return new ErrorResponse("INTERNAL_ERROR", "Unexpected error");
    }
}
