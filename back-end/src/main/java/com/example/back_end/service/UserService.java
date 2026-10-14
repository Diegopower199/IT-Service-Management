package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.dtos.user.ChangePasswordRequest;
import com.example.back_end.dtos.user.UserRequest;
import com.example.back_end.dtos.user.UserResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.RolRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {

        List<UserModel> listaUsuarios = userRepository.findAll();
        List<UserResponse> resultado = new ArrayList<>();

        for (UserModel user : listaUsuarios) {
            resultado.add(convertToResponse(user));
        }

        return resultado;
    }

    public UserResponse getUserById(Long userId) {

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario con id " + userId + " no encontrado"));

        return convertToResponse(user);
    }

    public UserResponse saveUser(UserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException(
                    "El username '" + request.getUsername() + "' ya existe");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "El email '" + request.getEmail() + "' ya existe");
        }

        RolModel rol = rolRepository.findById(request.getRol())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol con id " + request.getRol() + " no encontrado"));

        UserModel newUser = new UserModel();

        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEnabled(request.isEnabled());
        newUser.setRol(rol);

        UserModel savedUser = userRepository.save(newUser);

        return convertToResponse(savedUser);
    }

    public UserResponse updateUser(UserRequest request, Long userId) {

        UserModel existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario con id " + userId + " no encontrado"));

        if (!existingUser.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {

            throw new ResourceAlreadyExistsException(
                    "El username '" + request.getUsername() + "' ya existe");
        }

        if (!existingUser.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new ResourceAlreadyExistsException(
                    "El email '" + request.getEmail() + "' ya existe");
        }

        RolModel rol = rolRepository.findById(request.getRol())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rol con id " + request.getRol() + " no encontrado"));

        existingUser.setUsername(request.getUsername());
        existingUser.setEmail(request.getEmail());
        existingUser.setFirstName(request.getFirstName());
        existingUser.setLastName(request.getLastName());
        existingUser.setEnabled(request.isEnabled());
        existingUser.setRol(rol);

        UserModel updatedUser = userRepository.save(existingUser);

        return convertToResponse(updatedUser);
    }

    public void deleteUser(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario con id " + userId + " no encontrado"));

        userRepository.deleteById(userId);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario con id " + userId + " no encontrado"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "La contraseña actual no es correcta");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }

    private UserResponse convertToResponse(UserModel user) {

        RolResponse rolResponse = null;

        if (user.getRol() != null) {
            rolResponse = new RolResponse(
                    user.getRol().getIdRol(),
                    user.getRol().getName());
        }

        return new UserResponse(
                user.getIdUser(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                rolResponse);
    }
}
