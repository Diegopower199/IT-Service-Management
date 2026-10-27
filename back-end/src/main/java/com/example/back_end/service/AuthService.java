package com.example.back_end.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.UserRepository;
import com.example.back_end.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Autentica a un usuario con username y password.
     *
     * <p>
     * {@link AuthenticationManager} comprueba las credenciales utilizando
     * el AuthenticationProvider configurado en {@code ApplicationConfig}.
     * Si la autenticacion falla, Spring lanza una excepcion. Si es correcta,
     * se recupera el usuario, se genera su JWT y se devuelve junto con su
     * username y rol.
     * </p>
     *
     * @param request credenciales recibidas desde la API
     * @return respuesta que contiene el JWT, username y rol del usuario
     */
    public AuthLoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        UserModel user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.getToken(user);

        return new AuthLoginResponse(
                token,
                user.getUsername(),
                user.getRol().getName());
    }

}
