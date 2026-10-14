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

    public List<RolResponse> getAllRols() {

        List<RolModel> listRoles = rolRepository.findAllOrderedById();
        List<RolResponse> resultado = new ArrayList<>();

        for (RolModel rol : listRoles) {

            RolResponse response = new RolResponse(
                    rol.getIdRol(),
                    rol.getName());

            resultado.add(response);
        }

        return resultado;
    }

    public RolResponse saveRol(RolRequest request) {

        if (rolRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "El rol '" + request.getName() + "' ya existe");
        }

        RolModel newRol = new RolModel();
        newRol.setName(request.getName());

        RolModel savedRol = rolRepository.save(newRol);

        return new RolResponse(
                savedRol.getIdRol(),
                savedRol.getName());
    }

    public RolResponse getRolById(Long rolId) {

        RolModel foundRol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol con id " + rolId + " no encontrado"));

        return new RolResponse(
                foundRol.getIdRol(),
                foundRol.getName());
    }

    public RolResponse updateRol(RolRequest request, Long rolId) {

        RolModel existingRol = rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol con id " + rolId + " no encontrado"));

        if (!existingRol.getName().equals(request.getName())) {

            if (rolRepository.existsByName(request.getName())) {
                throw new ResourceAlreadyExistsException(
                        "El rol '" + request.getName() + "' ya existe");
            }

            existingRol.setName(request.getName());
        }

        RolModel updatedRol = rolRepository.save(existingRol);

        return new RolResponse(
                updatedRol.getIdRol(),
                updatedRol.getName());
    }

    public void deleteRol(Long rolId) {

        rolRepository.findById(rolId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol con id " + rolId + " no encontrado"));

        rolRepository.deleteById(rolId);
    }
}