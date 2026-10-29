package com.example.back_end.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.status.StatusRequest;
import com.example.back_end.dtos.status.StatusResponse;
import com.example.back_end.service.StatusService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/statuses")
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;

    @GetMapping
    public ResponseEntity<List<StatusResponse>> getAllStatuses() {
        List<StatusResponse> statuses = statusService.getAllStatuses();

        return ResponseEntity.ok(statuses);
    }

    @GetMapping("/active")
    public ResponseEntity<List<StatusResponse>> getActiveStatuses() {

        return ResponseEntity.ok(
                statusService.getActiveStatuses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatusResponse> getStatusById(
            @PathVariable Long id) {

        StatusResponse status = statusService.getStatusById(id);

        return ResponseEntity.ok(status);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatusResponse> createStatus(
            @Valid @RequestBody StatusRequest request) {

        StatusResponse savedStatus = statusService.createStatus(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedStatus);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatusResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest request) {

        StatusResponse updatedStatus = statusService.updateStatus(request, id);

        return ResponseEntity.ok(updatedStatus);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateStatus(@PathVariable Long id) {

        statusService.deactivateStatus(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateStatus(@PathVariable Long id) {

        statusService.activateStatus(id);

        return ResponseEntity.noContent().build();
    }
}
