package com.example.back_end.enums;

public enum ProtectedStatus {

    OPEN,
    IN_PROGRESS,
    WAITING,
    RESOLVED,
    CLOSED;

    public static boolean isProtectedStatus(String statusName) {
        for (ProtectedStatus status : values()) {
            if (status.name().equalsIgnoreCase(statusName)) {
                return true;
            }
        }

        return false;
    }
}