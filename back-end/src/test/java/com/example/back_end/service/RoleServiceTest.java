package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
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
class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleService roleService;

    @Test
    void getAllRolesShouldReturnAllRoles() {

        RoleModel adminRole = createRole(
                1L,
                "ADMIN");

        RoleModel userRole = createRole(
                2L,
                "USER");

        when(roleRepository.findAllOrderedById())
                .thenReturn(List.of(adminRole, userRole));

        List<RoleResponse> result = roleService.getAllRoles();

        assertThat(result)
                .hasSize(2);

        assertThat(result.get(0).getIdRole())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("ADMIN");

        assertThat(result.get(1).getIdRole())
                .isEqualTo(2L);

        assertThat(result.get(1).getName())
                .isEqualTo("USER");

        verify(roleRepository)
                .findAllOrderedById();
    }

    @Test
    void getRoleByIdShouldReturnRole() {

        Long roleId = 1L;

        RoleModel role = createRole(
                roleId,
                "ADMIN");

        when(roleRepository.findById(roleId))
                .thenReturn(Optional.of(role));

        RoleResponse result = roleService.getRoleById(roleId);

        assertThat(result.getIdRole())
                .isEqualTo(roleId);

        assertThat(result.getName())
                .isEqualTo("ADMIN");

        verify(roleRepository)
                .findById(roleId);
    }

    @Test
    void getRoleByIdShouldThrowExceptionWhenRoleDoesNotExist() {

        Long roleId = 1L;

        when(roleRepository.findById(roleId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> roleService.getRoleById(roleId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Role with id " + roleId + " not found");

        verify(roleRepository)
                .findById(roleId);
    }

    private RoleModel createRole(
            Long id,
            String name) {

        RoleModel role = new RoleModel();

        role.setIdRole(id);
        role.setName(name);

        return role;
    }
}