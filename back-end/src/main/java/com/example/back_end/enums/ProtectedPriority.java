package com.example.back_end.enums;

public enum ProtectedPriority {

    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    public static boolean isProtectedPriority(String priorityName) {

        for (ProtectedPriority priority : values()) {
            if (priority.name().equalsIgnoreCase(priorityName)) {
                return true;
            }
        }

        return false;
    }
}