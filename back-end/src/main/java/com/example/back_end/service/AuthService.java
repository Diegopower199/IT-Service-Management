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
     * Authenticates a user using their username and password.
     *
     * <p>
     * {@link AuthenticationManager} validates the provided credentials using
     * the AuthenticationProvider configured in {@code ApplicationConfig}.
     * If authentication fails, Spring throws an exception. If authentication
     * succeeds, the user is retrieved, a JWT is generated, and the token is
     * returned along with the user's username and role.
     * </p>
     *
     * @param request credentials received from the API
     * @return response containing the JWT, username, and user role
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
                user.getRole().getName());
    }

}
