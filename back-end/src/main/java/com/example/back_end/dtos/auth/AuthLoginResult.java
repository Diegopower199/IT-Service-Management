package com.example.back_end.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthLoginResult {

    private final AuthLoginResponse authLoginResponse;
    private final String refreshToken;
}
