package com.marketplace.exception;

public class PlanNotAvailableException extends RuntimeException {
    public PlanNotAvailableException(String message) {
        super(message);
    }
}
