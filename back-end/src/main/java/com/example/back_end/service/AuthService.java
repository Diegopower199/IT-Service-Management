package com.example.back_end.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.auth.AuthResponse;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.dtos.auth.RegisterRequest;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.DepartmentRepository;
import com.example.back_end.repository.RolRepository;
import com.example.back_end.repository.UserRepository;
import com.example.back_end.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RolRepository rolRepository;
    private final DepartmentRepository departmentRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Autentica a un usuario con username y password.
     *
     * <p>
     * {@link AuthenticationManager} comprueba las credenciales utilizando
     * el AuthenticationProvider configurado en {@code ApplicationConfig}.
     * Si la autenticacion falla, Spring lanza una excepcion. Si es correcta,
     * se recupera el usuario y se genera su JWT.
     * </p>
     *
     * @param request credenciales recibidas desde la API
     * @return respuesta que contiene el JWT
     */
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        UserDetails user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.getToken(user);

        return new AuthResponse(token);
    }

    /**
     * Registra un nuevo usuario.
     *
     * <p>
     * La password nunca se guarda en texto plano: se cifra primero mediante
     * el {@link PasswordEncoder}. Los usuarios nuevos reciben por defecto el
     * rol USER. Tras guardar el usuario se genera un JWT para que pueda empezar
     * a utilizar inmediatamente los endpoints protegidos.
     * </p>
     *
     * @param request datos del nuevo usuario
     * @return respuesta que contiene el JWT
     */
    public AuthResponse register(RegisterRequest request) {

        RolModel rol = rolRepository.findById(request.getRol())
                .orElseThrow(() -> new RuntimeException("Rol not found"));

        DepartmentModel department = departmentRepository.findById(request.getDepartment())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException(
                    "A user with username '" + request.getUsername() + "' already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "A user with email '" + request.getEmail() + "' already exists");
        }

        UserModel user = new UserModel();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(true);
        user.setRol(rol);
        user.setDepartment(department);

        userRepository.save(user);

        String token = jwtService.getToken(user);

        return new AuthResponse(token);
    }

}
