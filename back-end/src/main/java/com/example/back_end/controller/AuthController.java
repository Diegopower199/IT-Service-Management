package com.example.back_end.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.service.AuthService;
import com.example.back_end.utils.GlobalConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Controller REST que expone los endpoints publicos de autenticacion.
 *
 * <p>
 * La ruta base es {@code /auth}. En {@code SecurityConfig}, cualquier ruta
 * que empiece por {@code /auth/**} esta configurada con {@code permitAll()},
 * por lo que login y registro pueden utilizarse sin disponer previamente de
 * JWT.
 * </p>
 */
@CrossOrigin(origins = GlobalConstants.FRONTEND_URL, methods = { RequestMethod.POST })
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Inicia sesion y devuelve un JWT si las credenciales son correctas.
     *
     * @param request username y password
     * @return token JWT
     */
    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
