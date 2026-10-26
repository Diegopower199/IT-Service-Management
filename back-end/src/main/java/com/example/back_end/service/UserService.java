package com.example.back_end.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.dtos.rol.RolResponse;
import com.example.back_end.dtos.user.ChangePasswordRequest;
import com.example.back_end.dtos.user.CreateUserRequest;
import com.example.back_end.dtos.user.UpdateUserRequest;
import com.example.back_end.dtos.user.UserResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.RoleName;
import com.example.back_end.exception.InvalidPasswordException;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RolModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.DepartmentRepository;
import com.example.back_end.repository.RolRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RolRepository rolRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<UserResponse> getAllUsers(Pageable pageable) {

        Page<UserModel> users = userRepository.findAll(pageable);

        return users.map(this::convertToResponse);
    }

    public UserResponse getUserById(Long userId) {

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with id " + userId + " not found"));

        return convertToResponse(user);
    }

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException(
                    "Username '" + request.getUsername() + "' already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException(
                    "Email '" + request.getEmail() + "' already exists");
        }

        RolModel rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + request.getRolId() + " not found"));

        DepartmentModel department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department with id " + request.getDepartmentId() + " not found"));

        UserModel newUser = new UserModel();

        newUser.setUsername(request.getUsername());
        newUser.setPassword(
                passwordEncoder.encode(request.getPassword()));
        newUser.setEmail(request.getEmail());
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEnabled(request.isEnabled());
        newUser.setRol(rol);
        newUser.setDepartment(department);

        UserModel savedUser = userRepository.save(newUser);

        return convertToResponse(savedUser);
    }

    public UserResponse updateUser(
            UpdateUserRequest request,
            Long userId) {

        UserModel existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with id " + userId + " not found"));

        if (!existingUser.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {

            throw new ResourceAlreadyExistsException(
                    "Username '" + request.getUsername() + "' already exists");
        }

        if (!existingUser.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new ResourceAlreadyExistsException(
                    "Email '" + request.getEmail() + "' already exists");
        }

        RolModel rol = rolRepository.findById(request.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role with id " + request.getRolId() + " not found"));

        DepartmentModel department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department with id " + request.getDepartmentId() + " not found"));

        existingUser.setUsername(request.getUsername());
        existingUser.setEmail(request.getEmail());
        existingUser.setFirstName(request.getFirstName());
        existingUser.setLastName(request.getLastName());
        existingUser.setEnabled(request.isEnabled());
        existingUser.setRol(rol);
        existingUser.setDepartment(department);

        UserModel updatedUser = userRepository.save(existingUser);

        return convertToResponse(updatedUser);
    }

    public void changePassword(
            Long userId,
            ChangePasswordRequest request) {

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User with id " + userId + " not found"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new InvalidPasswordException(
                    "Current password is incorrect");
        }

        String newEncodedPassword = passwordEncoder.encode(request.getNewPassword());

        user.setPassword(newEncodedPassword);

        userRepository.save(user);
    }

    public List<UserSummaryResponse> getAllTechnicians() {

        return userRepository
                .findByRolNameAndEnabledTrue(RoleName.TECHNICIAN.name())
                .stream()
                .map(this::convertToSummaryResponse)
                .toList();
    }

    private UserResponse convertToResponse(UserModel user) {

        RolResponse rolResponse = null;
        DepartmentResponse departmentResponse = null;

        if (user.getRol() != null) {
            rolResponse = new RolResponse(
                    user.getRol().getIdRol(),
                    user.getRol().getName(),
                    user.getRol().isActive());
        }

        if (user.getDepartment() != null) {
            departmentResponse = new DepartmentResponse(
                    user.getDepartment().getIdDepartment(),
                    user.getDepartment().getName(),
                    user.getDepartment().isActive());
        }

        return new UserResponse(
                user.getIdUser(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                rolResponse,
                departmentResponse);
    }

    private UserSummaryResponse convertToSummaryResponse(UserModel user) {

        return new UserSummaryResponse(
                user.getIdUser(),
                user.getUsername());
    }
}