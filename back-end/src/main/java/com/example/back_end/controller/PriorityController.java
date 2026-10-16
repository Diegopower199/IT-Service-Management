package com.example.back_end.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.priority.PriorityRequest;
import com.example.back_end.dtos.priority.PriorityResponse;
import com.example.back_end.service.PriorityService;
import com.example.back_end.utils.GlobalConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = GlobalConstants.FRONTEND_URL, methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.PATCH
})
@RestController
@RequestMapping("/priorities")
@RequiredArgsConstructor
public class PriorityController {

    private final PriorityService priorityService;

    @GetMapping
    public ResponseEntity<List<PriorityResponse>> getAllPriorities() {
        List<PriorityResponse> priorities = priorityService.getAllPriorities();

        if (priorities.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(priorities);
    }

    @GetMapping("/actives")
    public ResponseEntity<List<PriorityResponse>> getActivePriorities() {

        return ResponseEntity.ok(
                priorityService.getActivePriorities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriorityResponse> getPriorityById(
            @PathVariable Long id) {

        PriorityResponse priority = priorityService.getPriorityById(id);

        return ResponseEntity.ok(priority);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PriorityResponse> createPriority(
            @Valid @RequestBody PriorityRequest request) {

        PriorityResponse savedPriority = priorityService.createPriority(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedPriority);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PriorityResponse> updatePriority(
            @PathVariable Long id,
            @Valid @RequestBody PriorityRequest request) {

        PriorityResponse updatedPriority = priorityService.updatePriority(request, id);

        return ResponseEntity.ok(updatedPriority);

    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivatePriority(@PathVariable Long id) {

        priorityService.deactivatePriority(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activatePriority(@PathVariable Long id) {

        priorityService.activatePriority(id);

        return ResponseEntity.noContent().build();
    }
}
