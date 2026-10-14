package com.example.back_end.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.rol.RolRequest;
import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.service.RolService;
import com.example.back_end.utils.GlobalConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = GlobalConstants.FRONTEND_URL, methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.PUT, RequestMethod.DELETE })
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<RolResponse>> getAll() {
        List<RolResponse> allRoles = rolService.getAllRols();

        if (allRoles.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok(allRoles);
        }
    }

    @PostMapping
    public ResponseEntity<RolResponse> createRol(@Valid @RequestBody RolRequest request) {

        RolResponse rolGuardado = rolService.saveRol(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(rolGuardado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolResponse> getRolById(@PathVariable Long id) {

        RolResponse rol = rolService.getRolById(id);

        return ResponseEntity.ok(rol);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolResponse> updateRol(
            @PathVariable Long id,
            @Valid @RequestBody RolRequest request) {

        RolResponse rolActualizado = rolService.updateRol(request, id);

        return ResponseEntity.ok(rolActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRol(@PathVariable Long id) {

        rolService.deleteRol(id);

        return ResponseEntity.noContent().build();
    }
}
