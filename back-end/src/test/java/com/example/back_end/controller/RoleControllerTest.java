package com.example.back_end.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.back_end.dtos.role.RoleResponse;
import com.example.back_end.service.RoleService;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    @Mock
    private RoleService roleService;

    @Mock
    private RoleResponse roleResponse;

    @InjectMocks
    private RoleController roleController;

    @Test
    void getAllRolesShouldReturnAllRoles() {

        List<RoleResponse> roles = List.of(roleResponse);

        when(roleService.getAllRoles())
                .thenReturn(roles);

        ResponseEntity<List<RoleResponse>> response = roleController.getAllRoles();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(roles);

        verify(roleService).getAllRoles();
    }

    @Test
    void getRoleByIdShouldReturnRole() {

        Long roleId = 1L;

        when(roleService.getRoleById(roleId))
                .thenReturn(roleResponse);

        ResponseEntity<RoleResponse> response = roleController.getRoleById(roleId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(roleResponse);

        verify(roleService).getRoleById(roleId);
    }
}