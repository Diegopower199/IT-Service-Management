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

import com.example.back_end.dtos.rol.RolRequest;
import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RolModel;
import com.example.back_end.repository.RolRepository;

@ExtendWith(MockitoExtension.class)
public class RolServiceTest {

    @Mock
    private RolRepository rolRepository;

    @InjectMocks
    private RolService rolService;

    // =========================================================
    // GET ALL ROLES
    // =========================================================
    @Test
    void shouldReturnAllRoles() {

        RolModel rol1 = new RolModel(1L, "ADMIN", true);

        RolModel rol2 = new RolModel(2L, "TECHNICIAN", true);

        List<RolModel> roles = List.of(rol1, rol2);

        when(rolRepository.findAllOrderedById())
                .thenReturn(roles);

        List<RolResponse> response = rolService.getAllRoles();

        assertEquals(2, response.size());
        assertEquals("ADMIN", response.get(0).getName());
        assertEquals("TECHNICIAN", response.get(1).getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoRolesExist() {

        when(rolRepository.findAllOrderedById())
                .thenReturn(List.of());

        List<RolResponse> response = rolService.getAllRoles();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ACTIVE ROLES
    // =========================================================
    @Test
    void shouldReturnActiveRoles() {

        RolModel rol1 = new RolModel(1L, "ADMIN", true);

        RolModel rol2 = new RolModel(2L, "TECHNICIAN", true);

        List<RolModel> roles = List.of(rol1, rol2);

        when(rolRepository.findByActiveTrueOrderByIdRolAsc())
                .thenReturn(roles);

        List<RolResponse> response = rolService.getActiveRoles();

        assertEquals(2, response.size());

        assertEquals("ADMIN", response.get(0).getName());
        assertEquals("TECHNICIAN", response.get(1).getName());

        assertTrue(response.get(0).isActive());
        assertTrue(response.get(1).isActive());
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveRolesExist() {

        when(rolRepository.findByActiveTrueOrderByIdRolAsc())
                .thenReturn(List.of());

        List<RolResponse> response = rolService.getActiveRoles();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ROL BY ID
    // =========================================================
    @Test
    void shouldReturnRolById() {

        RolModel rol = new RolModel(1L, "ADMIN", true);

        when(rolRepository.findById(1L))
                .thenReturn(Optional.of(rol));

        RolResponse response = rolService.getRolById(1L);

        assertEquals(1L, response.getIdRol());
        assertEquals("ADMIN", response.getName());
        assertTrue(response.isActive());
    }

    @Test
    void shouldThrowExceptionWhenRolByIdDoesNotExist() {

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> rolService.getRolById(99L));
    }

    // =========================================================
    // CREATE ROL
    // =========================================================
    @Test
    void shouldCreateRolSuccessfully() {

        RolRequest request = new RolRequest("MANAGER");

        RolModel savedRol = new RolModel(4L, "MANAGER", true);

        when(rolRepository.existsByName("MANAGER"))
                .thenReturn(false);

        when(rolRepository.save(any(RolModel.class)))
                .thenReturn(savedRol);

        RolResponse response = rolService.createRol(request);

        assertEquals(4L, response.getIdRol());
        assertEquals("MANAGER", response.getName());
        assertTrue(response.isActive());

        verify(rolRepository)
                .existsByName("MANAGER");

        verify(rolRepository)
                .save(any(RolModel.class));
    }

    @Test
    void shouldThrowExceptionWhenRolAlreadyExists() {

        RolRequest request = new RolRequest("ADMIN");

        when(rolRepository.existsByName("ADMIN"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> rolService.createRol(request));

        verify(rolRepository)
                .existsByName("ADMIN");

        verify(rolRepository, never())
                .save(any(RolModel.class));
    }

    // =========================================================
    // UPDATE ROL
    // =========================================================
    @Test
    void shouldUpdateRolSuccessfully() {

        RolRequest request = new RolRequest("MANAGER");

        RolModel existingRol = new RolModel(1L, "ADMIN", true);

        RolModel updatedRol = new RolModel(1L, "MANAGER", true);

        when(rolRepository.findById(1L))
                .thenReturn(Optional.of(existingRol));

        when(rolRepository.existsByName("MANAGER"))
                .thenReturn(false);

        when(rolRepository.save(any(RolModel.class)))
                .thenReturn(updatedRol);

        RolResponse response = rolService.updateRol(request, 1L);

        assertEquals(1L, response.getIdRol());
        assertEquals("MANAGER", response.getName());
        assertTrue(response.isActive());

        verify(rolRepository)
                .findById(1L);

        verify(rolRepository)
                .existsByName("MANAGER");

        verify(rolRepository)
                .save(any(RolModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingRol() {

        RolRequest request = new RolRequest("MANAGER");

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> rolService.updateRol(request, 99L));

        verify(rolRepository)
                .findById(99L);

        verify(rolRepository, never())
                .save(any(RolModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingRolWithExistingName() {

        RolRequest request = new RolRequest("TECHNICIAN");

        RolModel existingRol = new RolModel(1L, "ADMIN", true);

        when(rolRepository.findById(1L))
                .thenReturn(Optional.of(existingRol));

        when(rolRepository.existsByName("TECHNICIAN"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> rolService.updateRol(request, 1L));

        verify(rolRepository)
                .findById(1L);

        verify(rolRepository)
                .existsByName("TECHNICIAN");

        verify(rolRepository, never())
                .save(any(RolModel.class));
    }

    // =========================================================
    // DEACTIVATE ROL
    // =========================================================
    @Test
    void shouldDeactivateRolSuccessfully() {

        RolModel rol = new RolModel(4L, "MANAGER", true);

        when(rolRepository.findById(4L))
                .thenReturn(Optional.of(rol));

        when(rolRepository.save(any(RolModel.class)))
                .thenReturn(rol);

        rolService.deactivateRol(4L);

        assertFalse(rol.isActive());

        verify(rolRepository)
                .findById(4L);

        verify(rolRepository)
                .save(rol);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingNonExistingRol() {

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> rolService.deactivateRol(99L));

        verify(rolRepository)
                .findById(99L);

        verify(rolRepository, never())
                .save(any(RolModel.class));
    }

    // =========================================================
    // ACTIVATE ROL
    // =========================================================
    @Test
    void shouldActivateRolSuccessfully() {

        RolModel rol = new RolModel(4L, "MANAGER", false);

        when(rolRepository.findById(4L))
                .thenReturn(Optional.of(rol));

        when(rolRepository.save(any(RolModel.class)))
                .thenReturn(rol);

        rolService.activateRol(4L);

        assertTrue(rol.isActive());

        verify(rolRepository)
                .findById(4L);

        verify(rolRepository)
                .save(rol);
    }

    @Test
    void shouldThrowExceptionWhenActivatingNonExistingRol() {

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> rolService.activateRol(99L));

        verify(rolRepository)
                .findById(99L);

        verify(rolRepository, never())
                .save(any(RolModel.class));
    }
}
