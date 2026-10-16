package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.status.StatusRequest;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.StatusModel;
import com.example.back_end.repository.StatusRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository statusRepository;

    public List<StatusResponse> getAllStatuses() {

        List<StatusModel> statuses = statusRepository.findAllOrderedById();

        List<StatusResponse> result = new ArrayList<>();

        for (StatusModel status : statuses) {
            result.add(convertToResponse(status));
        }

        return result;
    }

    public List<StatusResponse> getActiveStatuses() {

        List<StatusModel> statuses = statusRepository.findByActiveTrueOrderByIdStatusAsc();

        List<StatusResponse> result = new ArrayList<>();

        for (StatusModel status : statuses) {
            result.add(convertToResponse(status));
        }

        return result;
    }

    public StatusResponse getStatusById(Long statusId) {

        StatusModel status = statusRepository.findById(statusId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Status with id " + statusId + " not found"));

        return convertToResponse(status);
    }

    public StatusResponse createStatus(StatusRequest request) {

        if (statusRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Status '" + request.getName() + "' already exists");
        }

        StatusModel newStatus = new StatusModel();
        newStatus.setName(request.getName());
        newStatus.setActive(true);

        StatusModel savedStatus = statusRepository.save(newStatus);

        return convertToResponse(savedStatus);
    }

    public StatusResponse updateStatus(
            StatusRequest request,
            Long statusId) {

        StatusModel existingStatus = statusRepository.findById(statusId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Status with id " + statusId + " not found"));

        if (!existingStatus.getName().equalsIgnoreCase(request.getName())
                && statusRepository.existsByName(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Status '" + request.getName() + "' already exists");
        }

        existingStatus.setName(request.getName());

        StatusModel updatedStatus = statusRepository.save(existingStatus);

        return convertToResponse(updatedStatus);
    }

    public void deactivateStatus(Long id) {

        StatusModel status = statusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Status with id " + id + " not found"));

        status.setActive(false);

        statusRepository.save(status);
    }

    public void activateStatus(Long id) {

        StatusModel status = statusRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Status with id " + id + " not found"));

        status.setActive(true);

        statusRepository.save(status);
    }

    private StatusResponse convertToResponse(StatusModel status) {

        return new StatusResponse(
                status.getIdStatus(),
                status.getName(),
                status.isActive());
    }
}