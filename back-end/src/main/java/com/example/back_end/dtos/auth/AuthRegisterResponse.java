package com.example.back_end.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta devuelto despues de un login o registro correcto.
 *
 * <p>Actualmente solo contiene el JWT que el cliente debera enviar en las
 * siguientes peticiones usando la cabecera:</p>
 *
 * <pre>Authorization: Bearer &lt;token&gt;</pre>
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRegisterResponse {
    private String token;
}

