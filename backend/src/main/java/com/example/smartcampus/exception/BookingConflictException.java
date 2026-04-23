package com.example.smartcampus.exception;

/**
 * Exception thrown when a booking conflict is detected
 */
public class BookingConflictException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;
    private String resource;
    
    public BookingConflictException(String message) {
        super(message);
    }
    
    public BookingConflictException(String message, String resource) {
        super(message);
        this.resource = resource;
    }
    
    public BookingConflictException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public String getResource() {
        return resource;
    }
    
    public void setResource(String resource) {
        this.resource = resource;
    }
}
