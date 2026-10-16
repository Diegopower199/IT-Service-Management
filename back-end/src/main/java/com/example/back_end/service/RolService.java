package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.rol.RolRequest;
import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RolModel;
import com.example.back_end.repository.RolRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;

    public List<RolResponse> getAllRoles() {

        List<RolModel> roles = rolRepository.findAllOrderedById();
        List<RolResponse> result = new ArrayList<>();

        for (RolModel rol : roles) {
            result.add(convertToResponse(rol));
        }

        return result;
    }

    public List<RolResponse> getActiveRoles() {

        List<RolModel> roles = rolRepository.findByActiveTrueOrderByIdRolAsc();
        List<RolResponse> result = new ArrayList<>();

        for (RolModel rol : roles) {
            result.add(convertToResponse(rol));
        }

        return result;
    }

    public RolResponse getRolById(Long rolId) {

        RolModel rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + rolId + " not found"));

        return convertToResponse(rol);
    }

    public RolResponse createRol(RolRequest request) {

        if (rolRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Role '" + request.getName() + "' already exists");
        }

        RolModel newRol = new RolModel();
        newRol.setName(request.getName());
        newRol.setActive(true);

        RolModel savedRol = rolRepository.save(newRol);

        return convertToResponse(savedRol);
    }

    public RolResponse updateRol(
            RolRequest request,
            Long rolId) {

        RolModel existingRol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + rolId + " not found"));

        if (!existingRol.getName().equalsIgnoreCase(request.getName())
                && rolRepository.existsByName(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Role '" + request.getName() + "' already exists");
        }

        existingRol.setName(request.getName());

        RolModel updatedRol = rolRepository.save(existingRol);

        return convertToResponse(updatedRol);
    }

    public void deactivateRol(Long id) {

        RolModel rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + id + " not found"));

        rol.setActive(false);

        rolRepository.save(rol);
    }

    public void activateRol(Long id) {

        RolModel rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + id + " not found"));

        rol.setActive(true);

        rolRepository.save(rol);
    }

    private RolResponse convertToResponse(RolModel rol) {

        return new RolResponse(
                rol.getIdRol(),
                rol.getName(),
                rol.isActive());
    }
}