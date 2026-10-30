package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.back_end.dtos.role.RoleResponse;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RoleModel;
import com.example.back_end.repository.RoleRepository;

@ExtendWith(MockitoExtension.class)
public class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleService roleService;

    // =========================================================
    // GET ALL ROLES
    // =========================================================
    @Test
    void shouldReturnAllRoles() {

        RoleModel role1 = new RoleModel(1L, "ADMIN");
        RoleModel role2 = new RoleModel(2L, "TECHNICIAN");

        List<RoleModel> roles = List.of(role1, role2);

        when(roleRepository.findAllOrderedById())
                .thenReturn(roles);

        List<RoleResponse> response = roleService.getAllRoles();

        assertEquals(2, response.size());
        assertEquals("ADMIN", response.get(0).getName());
        assertEquals("TECHNICIAN", response.get(1).getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoRolesExist() {

        when(roleRepository.findAllOrderedById())
                .thenReturn(List.of());

        List<RoleResponse> response = roleService.getAllRoles();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ROLE BY ID
    // =========================================================
    @Test
    void shouldReturnRoleById() {

        RoleModel role = new RoleModel(1L, "ADMIN");

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(role));

        RoleResponse response = roleService.getRoleById(1L);

        assertEquals(1L, response.getIdRole());
        assertEquals("ADMIN", response.getName());

    }

    @Test
    void shouldThrowExceptionWhenRoleByIdDoesNotExist() {

        when(roleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> roleService.getRoleById(99L));
    }

}