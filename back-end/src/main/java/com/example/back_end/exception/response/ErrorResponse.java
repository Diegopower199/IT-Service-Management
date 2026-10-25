package com.example.back_end.exception.response;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private int status;

    private String code;

    private String message;

    private Map<String, String> errors;

    private LocalDateTime timestamp;
}