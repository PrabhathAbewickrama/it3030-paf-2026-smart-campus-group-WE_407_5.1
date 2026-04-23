package com.example.smartcampus.dto.booking;

import com.example.smartcampus.enums.BookingStatus;

public class BookingApprovalDTO {

    private BookingStatus status;
    private String adminReason;

    // Getters and Setters

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getAdminReason() {
        return adminReason;
    }

    public void setAdminReason(String adminReason) {
        this.adminReason = adminReason;
    }
}