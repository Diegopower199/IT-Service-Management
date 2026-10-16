package com.example.back_end.dtos.rol;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolResponse {

    private Long idRol;
    private String name;
    private boolean active;
}
