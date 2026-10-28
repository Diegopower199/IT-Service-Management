package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.role.RoleRequest;
import com.example.back_end.dtos.role.RoleResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RoleModel;
import com.example.back_end.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public List<RoleResponse> getAllRoles() {

        List<RoleModel> roles = roleRepository.findAllOrderedById();

        List<RoleResponse> result = new ArrayList<>();

        for (RoleModel role : roles) {
            result.add(convertToResponse(role));
        }

        return result;
    }

    public List<RoleResponse> getActiveRoles() {

        List<RoleModel> roles = roleRepository.findByActiveTrueOrderByIdRoleAsc();

        List<RoleResponse> result = new ArrayList<>();

        for (RoleModel role : roles) {
            result.add(convertToResponse(role));
        }

        return result;
    }

    public RoleResponse getRoleById(Long roleId) {

        RoleModel role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + roleId + " not found"));

        return convertToResponse(role);
    }

    public RoleResponse createRole(RoleRequest request) {

        if (roleRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Role '" + request.getName() + "' already exists");
        }

        RoleModel newRole = new RoleModel();
        newRole.setName(request.getName());
        newRole.setActive(true);

        RoleModel savedRole = roleRepository.save(newRole);

        return convertToResponse(savedRole);
    }

    public RoleResponse updateRole(
            RoleRequest request,
            Long roleId) {

        RoleModel existingRole = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id "
                                + roleId
                                + " not found"));

        if (!existingRole.getName()
                .equalsIgnoreCase(request.getName())
                && roleRepository.existsByName(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Role '" + request.getName() + "' already exists");
        }

        existingRole.setName(request.getName());

        RoleModel updatedRole = roleRepository.save(existingRole);

        return convertToResponse(updatedRole);
    }

    public void deactivateRole(Long id) {

        RoleModel role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + id + " not found"));

        role.setActive(false);

        roleRepository.save(role);
    }

    public void activateRole(Long id) {

        RoleModel role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + id + " not found"));

        role.setActive(true);

        roleRepository.save(role);
    }

    private RoleResponse convertToResponse(RoleModel role) {

        return new RoleResponse(
                role.getIdRole(),
                role.getName(),
                role.isActive());
    }
}