package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.back_end.dtos.role.RoleRequest;
import com.example.back_end.dtos.role.RoleResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
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

        RoleModel role1 = new RoleModel(1L, "ADMIN", true);
        RoleModel role2 = new RoleModel(2L, "TECHNICIAN", true);

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
    // GET ACTIVE ROLES
    // =========================================================

    @Test
    void shouldReturnActiveRoles() {

        RoleModel role1 = new RoleModel(1L, "ADMIN", true);
        RoleModel role2 = new RoleModel(2L, "TECHNICIAN", true);

        List<RoleModel> roles = List.of(role1, role2);

        when(roleRepository.findByActiveTrueOrderByIdRoleAsc())
                .thenReturn(roles);

        List<RoleResponse> response = roleService.getActiveRoles();

        assertEquals(2, response.size());

        assertEquals("ADMIN", response.get(0).getName());
        assertEquals("TECHNICIAN", response.get(1).getName());

        assertTrue(response.get(0).isActive());
        assertTrue(response.get(1).isActive());
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveRolesExist() {

        when(roleRepository.findByActiveTrueOrderByIdRoleAsc())
                .thenReturn(List.of());

        List<RoleResponse> response = roleService.getActiveRoles();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ROLE BY ID
    // =========================================================

    @Test
    void shouldReturnRoleById() {

        RoleModel role = new RoleModel(1L, "ADMIN", true);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(role));

        RoleResponse response = roleService.getRoleById(1L);

        assertEquals(1L, response.getIdRole());
        assertEquals("ADMIN", response.getName());
        assertTrue(response.isActive());
    }

    @Test
    void shouldThrowExceptionWhenRoleByIdDoesNotExist() {

        when(roleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> roleService.getRoleById(99L));
    }

    // =========================================================
    // CREATE ROLE
    // =========================================================

    @Test
    void shouldCreateRoleSuccessfully() {

        RoleRequest request = new RoleRequest("MANAGER");

        RoleModel savedRole = new RoleModel(4L, "MANAGER", true);

        when(roleRepository.existsByName("MANAGER"))
                .thenReturn(false);

        when(roleRepository.save(any(RoleModel.class)))
                .thenReturn(savedRole);

        RoleResponse response = roleService.createRole(request);

        assertEquals(4L, response.getIdRole());
        assertEquals("MANAGER", response.getName());
        assertTrue(response.isActive());

        verify(roleRepository)
                .existsByName("MANAGER");

        verify(roleRepository)
                .save(any(RoleModel.class));
    }

    @Test
    void shouldThrowExceptionWhenRoleAlreadyExists() {

        RoleRequest request = new RoleRequest("ADMIN");

        when(roleRepository.existsByName("ADMIN"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> roleService.createRole(request));

        verify(roleRepository)
                .existsByName("ADMIN");

        verify(roleRepository, never())
                .save(any(RoleModel.class));
    }

    // =========================================================
    // UPDATE ROLE
    // =========================================================

    @Test
    void shouldUpdateRoleSuccessfully() {

        RoleRequest request = new RoleRequest("MANAGER");

        RoleModel existingRole = new RoleModel(1L, "ADMIN", true);
        RoleModel updatedRole = new RoleModel(1L, "MANAGER", true);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(existingRole));

        when(roleRepository.existsByName("MANAGER"))
                .thenReturn(false);

        when(roleRepository.save(any(RoleModel.class)))
                .thenReturn(updatedRole);

        RoleResponse response = roleService.updateRole(request, 1L);

        assertEquals(1L, response.getIdRole());
        assertEquals("MANAGER", response.getName());
        assertTrue(response.isActive());

        verify(roleRepository)
                .findById(1L);

        verify(roleRepository)
                .existsByName("MANAGER");

        verify(roleRepository)
                .save(any(RoleModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingRole() {

        RoleRequest request = new RoleRequest("MANAGER");

        when(roleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> roleService.updateRole(request, 99L));

        verify(roleRepository)
                .findById(99L);

        verify(roleRepository, never())
                .save(any(RoleModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingRoleWithExistingName() {

        RoleRequest request = new RoleRequest("TECHNICIAN");

        RoleModel existingRole = new RoleModel(1L, "ADMIN", true);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(existingRole));

        when(roleRepository.existsByName("TECHNICIAN"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> roleService.updateRole(request, 1L));

        verify(roleRepository)
                .findById(1L);

        verify(roleRepository)
                .existsByName("TECHNICIAN");

        verify(roleRepository, never())
                .save(any(RoleModel.class));
    }

    // =========================================================
    // DEACTIVATE ROLE
    // =========================================================

    @Test
    void shouldDeactivateRoleSuccessfully() {

        RoleModel role = new RoleModel(4L, "MANAGER", true);

        when(roleRepository.findById(4L))
                .thenReturn(Optional.of(role));

        when(roleRepository.save(any(RoleModel.class)))
                .thenReturn(role);

        roleService.deactivateRole(4L);

        assertFalse(role.isActive());

        verify(roleRepository)
                .findById(4L);

        verify(roleRepository)
                .save(role);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingNonExistingRole() {

        when(roleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> roleService.deactivateRole(99L));

        verify(roleRepository)
                .findById(99L);

        verify(roleRepository, never())
                .save(any(RoleModel.class));
    }

    // =========================================================
    // ACTIVATE ROLE
    // =========================================================

    @Test
    void shouldActivateRoleSuccessfully() {

        RoleModel role = new RoleModel(4L, "MANAGER", false);

        when(roleRepository.findById(4L))
                .thenReturn(Optional.of(role));

        when(roleRepository.save(any(RoleModel.class)))
                .thenReturn(role);

        roleService.activateRole(4L);

        assertTrue(role.isActive());

        verify(roleRepository)
                .findById(4L);

        verify(roleRepository)
                .save(role);
    }

    @Test
    void shouldThrowExceptionWhenActivatingNonExistingRole() {

        when(roleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> roleService.activateRole(99L));

        verify(roleRepository)
                .findById(99L);

        verify(roleRepository, never())
                .save(any(RoleModel.class));
    }
}