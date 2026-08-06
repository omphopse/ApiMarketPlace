package com.marketplace.exception;

public class ApiNotAvailableException extends RuntimeException {
    public ApiNotAvailableException(String message) {
        super(message);
    }
}
