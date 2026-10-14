package com.example.back_end.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de entrada utilizado en el endpoint de login.
 *
 * <p>Un DTO evita exponer directamente la entidad {@code User} en la API y
 * permite recibir exclusivamente los datos necesarios para autenticarse.</p>
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    private String username;
    private String password;
}
