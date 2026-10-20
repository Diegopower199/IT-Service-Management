package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.AuthRegisterResponse;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.dtos.auth.RegisterRequest;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.DepartmentRepository;
import com.example.back_end.repository.RolRepository;
import com.example.back_end.repository.UserRepository;
import com.example.back_end.security.JwtService;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    // =========================================================
    // LOGIN
    // =========================================================
    @Test
    void shouldLoginSuccessfully() {

        LoginRequest request = org.mockito.Mockito.mock(LoginRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getPassword())
                .thenReturn("password123");

        RolModel rol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel user = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                rol,
                department);

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.of(user));

        when(jwtService.getToken(user))
                .thenReturn("jwt-token");

        AuthLoginResponse response = authService.login(request);

        assertEquals(
                "jwt-token",
                response.getToken());

        assertEquals(
                "ana",
                response.getUsername());

        assertEquals(
                "USER",
                response.getRol());

        verify(authenticationManager)
                .authenticate(
                        any(UsernamePasswordAuthenticationToken.class));

        verify(userRepository)
                .findByUsername("ana");

        verify(jwtService)
                .getToken(user);
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExistAfterAuthentication() {

        LoginRequest request = org.mockito.Mockito.mock(LoginRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getPassword())
                .thenReturn("password123");

        when(userRepository.findByUsername("ana"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> authService.login(request));

        verify(authenticationManager)
                .authenticate(
                        any(UsernamePasswordAuthenticationToken.class));

        verify(userRepository)
                .findByUsername("ana");

        verify(jwtService, never())
                .getToken(any());
    }

    // =========================================================
    // REGISTER
    // =========================================================
    @Test
    void shouldRegisterUserSuccessfully() {

        RegisterRequest request = org.mockito.Mockito.mock(RegisterRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(request.getPassword())
                .thenReturn("password123");

        when(request.getFirstName())
                .thenReturn("Ana");

        when(request.getLastName())
                .thenReturn("Garcia");

        when(request.getRol())
                .thenReturn(3L);

        when(request.getDepartment())
                .thenReturn(1L);

        RolModel rol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(rol));

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(false);

        when(passwordEncoder.encode("password123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(UserModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(jwtService.getToken(any(UserModel.class)))
                .thenReturn("jwt-token");

        AuthRegisterResponse response = authService.register(request);

        assertEquals(
                "jwt-token",
                response.getToken());

        verify(rolRepository)
                .findById(3L);

        verify(departmentRepository)
                .findById(1L);

        verify(userRepository)
                .existsByUsername("ana");

        verify(userRepository)
                .existsByEmail("ana@example.com");

        verify(passwordEncoder)
                .encode("password123");

        verify(userRepository)
                .save(any(UserModel.class));

        verify(jwtService)
                .getToken(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenRoleDoesNotExist() {

        RegisterRequest request = org.mockito.Mockito.mock(RegisterRequest.class);

        when(request.getRol())
                .thenReturn(99L);

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> authService.register(request));

        verify(departmentRepository, never())
                .findById(any());

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenDepartmentDoesNotExist() {

        RegisterRequest request = org.mockito.Mockito.mock(RegisterRequest.class);

        when(request.getRol())
                .thenReturn(3L);

        when(request.getDepartment())
                .thenReturn(99L);

        RolModel rol = new RolModel(
                3L,
                "USER",
                true);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(rol));

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> authService.register(request));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {

        RegisterRequest request = org.mockito.Mockito.mock(RegisterRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getRol())
                .thenReturn(3L);

        when(request.getDepartment())
                .thenReturn(1L);

        RolModel rol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(rol));

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(userRepository.existsByUsername("ana"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> authService.register(request));

        verify(userRepository)
                .existsByUsername("ana");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        RegisterRequest request = org.mockito.Mockito.mock(RegisterRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(request.getRol())
                .thenReturn(3L);

        when(request.getDepartment())
                .thenReturn(1L);

        RolModel rol = new RolModel(
                3L,
                "USER",
                true);

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(rol));

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> authService.register(request));

        verify(userRepository)
                .existsByEmail("ana@example.com");

        verify(passwordEncoder, never())
                .encode(any());

        verify(userRepository, never())
                .save(any(UserModel.class));
    }
}