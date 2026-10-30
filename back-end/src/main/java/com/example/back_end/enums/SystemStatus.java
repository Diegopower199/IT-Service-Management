package com.example.back_end.enums;

public enum SystemStatus {

    OPEN,
    IN_PROGRESS,
    WAITING,
    RESOLVED,
    CLOSED;

    public static boolean isSystemStatus(String statusName) {
        for (SystemStatus status : values()) {
            if (status.name().equalsIgnoreCase(statusName)) {
                return true;
            }
        }

        return false;
    }
}