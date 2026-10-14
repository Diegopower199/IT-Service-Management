package com.example.back_end.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de entrada utilizado para registrar un nuevo usuario.
 *
 * <p>
 * Contiene únicamente los datos que el cliente debe enviar durante
 * el registro.
 * </p>
 *
 * <p>
 * El rol no se recibe desde el cliente, ya que el backend asignará
 * por defecto el rol USER. El campo enabled tampoco se recibe, ya que
 * el usuario se crea habilitado por defecto.
 * </p>
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Long roleId;
}
