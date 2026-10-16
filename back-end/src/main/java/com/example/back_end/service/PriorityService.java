package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.priority.PriorityRequest;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.PriorityModel;
import com.example.back_end.repository.PriorityRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PriorityService {

    private final PriorityRepository priorityRepository;

    public List<PriorityResponse> getAllPriorities() {

        List<PriorityModel> priorities = priorityRepository.findAllOrderedById();
        List<PriorityResponse> result = new ArrayList<>();

        for (PriorityModel priority : priorities) {
            result.add(convertToResponse(priority));
        }

        return result;
    }

    public List<PriorityResponse> getActivePriorities() {

        List<PriorityModel> priorities = priorityRepository.findByActiveTrueOrderByIdPriorityAsc();

        List<PriorityResponse> result = new ArrayList<>();

        for (PriorityModel priority : priorities) {
            result.add(convertToResponse(priority));
        }

        return result;
    }

    public PriorityResponse getPriorityById(Long priorityId) {

        PriorityModel priority = priorityRepository.findById(priorityId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Priority with id " + priorityId + " not found"));

        return convertToResponse(priority);
    }

    public PriorityResponse createPriority(PriorityRequest request) {

        if (priorityRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Priority '" + request.getName() + "' already exists");
        }

        PriorityModel newPriority = new PriorityModel();
        newPriority.setName(request.getName());
        newPriority.setActive(true);

        PriorityModel savedPriority = priorityRepository.save(newPriority);

        return convertToResponse(savedPriority);
    }

    public PriorityResponse updatePriority(
            PriorityRequest request,
            Long priorityId) {

        PriorityModel existingPriority = priorityRepository.findById(priorityId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Priority with id " + priorityId + " not found"));

        if (!existingPriority.getName().equals(request.getName())
                && priorityRepository.existsByName(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Priority '" + request.getName() + "' already exists");
        }

        existingPriority.setName(request.getName());

        PriorityModel updatedPriority = priorityRepository.save(existingPriority);

        return convertToResponse(updatedPriority);
    }

    public void deactivatePriority(Long id) {

        PriorityModel priority = priorityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Priority with id " + id + " not found"));

        priority.setActive(false);

        priorityRepository.save(priority);
    }

    public void activatePriority(Long id) {

        PriorityModel priority = priorityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Priority with id " + id + " not found"));

        priority.setActive(true);

        priorityRepository.save(priority);
    }

    private PriorityResponse convertToResponse(PriorityModel priority) {

        return new PriorityResponse(
                priority.getIdPriority(),
                priority.getName(),
                priority.isActive());
    }
}
