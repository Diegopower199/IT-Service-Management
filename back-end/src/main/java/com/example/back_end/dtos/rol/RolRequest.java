package com.example.back_end.dtos.rol;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolRequest {

    @NotBlank(message = "El campo 'name' es obligatorio")
    private String name;
}
