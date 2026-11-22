package com.example.back_end.service;

import java.util.Locale;
import java.util.Set;

import org.springframework.security.access.AccessDeniedException;

import com.example.back_end.enums.RoleName;
import com.example.back_end.model.RoleModel;

final class DemoAccountAccess {

    private static final String DEMO_ADMIN = "admin_demo";
    private static final Set<String> DEMO_ACCOUNTS = Set.of(DEMO_ADMIN, "technician_demo", "user_demo");

    private DemoAccountAccess() {
    }

    static void requireUserEditable(String actorUsername, String targetUsername) {
        String target = normalize(targetUsername);
        if (DEMO_ADMIN.equals(normalize(actorUsername))
                && ("admin".equals(target) || DEMO_ACCOUNTS.contains(target))) {
            throw new AccessDeniedException("This account is read-only for the demo administrator");
        }
    }

    static void requireProfileEditable(String username) {
        if (DEMO_ACCOUNTS.contains(normalize(username))) {
            throw new AccessDeniedException("The profile and password of a demo account are read-only");
        }
    }

    static void requireRoleAssignable(String actorUsername, RoleModel role, RoleModel currentRole) {
        if (DEMO_ADMIN.equals(normalize(actorUsername))
                && isAdminRole(role) && !isAdminRole(currentRole)) {
            throw new AccessDeniedException("Only private administrators can grant the ADMIN role");
        }
    }

    private static boolean isAdminRole(RoleModel role) {
        return role != null && RoleName.ADMIN.name().equalsIgnoreCase(role.getName());
    }

    private static String normalize(String username) {
        return username.toLowerCase(Locale.ROOT);
    }
}
