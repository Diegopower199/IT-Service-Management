package com.example.back_end.dtos.priority;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriorityResponse {

    private Long idPriority;
    private String name;
    private boolean active;
}