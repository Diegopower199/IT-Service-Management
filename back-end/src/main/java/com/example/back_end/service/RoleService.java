package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.role.RoleResponse;
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

    public RoleResponse getRoleById(Long roleId) {

        RoleModel role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + roleId + " not found"));

        return convertToResponse(role);
    }

    private RoleResponse convertToResponse(RoleModel role) {

        return new RoleResponse(
                role.getIdRole(),
                role.getName());
    }
}