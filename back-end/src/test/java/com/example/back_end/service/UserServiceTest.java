package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.back_end.dtos.user.CreateUserRequest;
import com.example.back_end.dtos.user.UpdateUserRequest;
import com.example.back_end.dtos.user.UserResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RoleModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.DepartmentRepository;
import com.example.back_end.repository.RoleRepository;
import com.example.back_end.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository rolRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    // =========================================================
    // GET ALL USERS
    // =========================================================
    @Test
    void shouldReturnAllUsers() {

        RoleModel adminRol = new RoleModel(1L, "ADMIN", true);

        DepartmentModel itDepartment = new DepartmentModel(1L, "IT", true);

        UserModel user1 = new UserModel(
                1L,
                "admin",
                "admin@example.com",
                "encodedPassword",
                "Admin",
                "User",
                true,
                adminRol,
                itDepartment);

        RoleModel technicianRol = new RoleModel(2L, "TECHNICIAN", true);

        DepartmentModel supportDepartment = new DepartmentModel(2L, "Support", true);

        UserModel user2 = new UserModel(
                2L,
                "carlos",
                "carlos@example.com",
                "encodedPassword",
                "Carlos",
                "Lopez",
                true,
                technicianRol,
                supportDepartment);

        Pageable pageable = PageRequest.of(0, 10);

        Page<UserModel> userPage = new PageImpl<>(
                List.of(user1, user2),
                pageable,
                2);

        when(userRepository.findAll(pageable))
                .thenReturn(userPage);

        Page<UserResponse> response = userService.getAllUsers(pageable);

        assertEquals(
                2,
                response.getTotalElements());

        assertEquals(
                2,
                response.getContent().size());

        assertEquals(
                1L,
                response.getContent()
                        .get(0)
                        .getIdUser());

        assertEquals(
                "admin",
                response.getContent()
                        .get(0)
                        .getUsername());

        assertEquals(
                "admin@example.com",
                response.getContent()
                        .get(0)
                        .getEmail());

        assertEquals(
                "ADMIN",
                response.getContent()
                        .get(0)
                        .getRole()
                        .getName());

        assertEquals(
                "IT",
                response.getContent()
                        .get(0)
                        .getDepartment()
                        .getName());

        assertEquals(
                2L,
                response.getContent()
                        .get(1)
                        .getIdUser());

        assertEquals(
                "carlos",
                response.getContent()
                        .get(1)
                        .getUsername());

        assertEquals(
                "carlos@example.com",
                response.getContent()
                        .get(1)
                        .getEmail());

        assertEquals(
                "TECHNICIAN",
                response.getContent()
                        .get(1)
                        .getRole()
                        .getName());

        assertEquals(
                "Support",
                response.getContent()
                        .get(1)
                        .getDepartment()
                        .getName());

        verify(userRepository)
                .findAll(pageable);
    }

    @Test
    void shouldReturnEmptyPageWhenNoUsersExist() {

        Pageable pageable = PageRequest.of(0, 10);

        when(userRepository.findAll(pageable))
                .thenReturn(Page.empty(pageable));

        Page<UserResponse> response = userService.getAllUsers(pageable);

        assertTrue(response.isEmpty());

        assertEquals(
                0,
                response.getTotalElements());

        verify(userRepository)
                .findAll(pageable);
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================
    @Test
    void shouldReturnUserById() {

        RoleModel role = new RoleModel(1L, "ADMIN", true);

        DepartmentModel department = new DepartmentModel(1L, "IT", true);

        UserModel user = new UserModel(
                1L,
                "admin",
                "admin@example.com",
                "encodedPassword",
                "Admin",
                "User",
                true,
                role,
                department);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        UserResponse response = userService.getUserById(1L);

        assertEquals(1L, response.getIdUser());
        assertEquals("admin", response.getUsername());
        assertEquals("admin@example.com", response.getEmail());
        assertEquals("Admin", response.getFirstName());
        assertEquals("User", response.getLastName());
        assertTrue(response.isEnabled());
        assertEquals("ADMIN", response.getRole().getName());
        assertEquals("IT", response.getDepartment().getName());
    }

    @Test
    void shouldThrowExceptionWhenUserByIdDoesNotExist() {

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getUserById(99L));
    }

    // =========================================================
    // CREATE USER
    // =========================================================
    @Test
    void shouldCreateUserSuccessfully() {

        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername()).thenReturn("ana");
        when(request.getPassword()).thenReturn("password123");
        when(request.getEmail()).thenReturn("ana@example.com");
        when(request.getFirstName()).thenReturn("Ana");
        when(request.getLastName()).thenReturn("Garcia");
        when(request.isEnabled()).thenReturn(true);
        when(request.getRoleId()).thenReturn(3L);
        when(request.getDepartmentId()).thenReturn(2L);

        RoleModel role = new RoleModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(2L, "Finance", true);

        UserModel savedUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                role,
                department);

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(false);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(2L))
                .thenReturn(Optional.of(department));

        when(passwordEncoder.encode("password123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(UserModel.class)))
                .thenReturn(savedUser);

        UserResponse response = userService.createUser(request);

        assertEquals(1L, response.getIdUser());
        assertEquals("ana", response.getUsername());
        assertEquals("ana@example.com", response.getEmail());
        assertEquals("USER", response.getRole().getName());
        assertEquals("Finance", response.getDepartment().getName());

        verify(passwordEncoder)
                .encode("password123");

        verify(userRepository)
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {

        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(userRepository.existsByUsername("ana"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> userService.createUser(request));

        verify(userRepository)
                .existsByUsername("ana");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> userService.createUser(request));

        verify(userRepository)
                .existsByEmail("ana@example.com");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenRoleDoesNotExistOnCreate() {

        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(request.getRoleId())
                .thenReturn(99L);

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(false);

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.createUser(request));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenDepartmentDoesNotExistOnCreate() {

        CreateUserRequest request = mock(CreateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(request.getRoleId())
                .thenReturn(3L);

        when(request.getDepartmentId())
                .thenReturn(99L);

        RoleModel role = new RoleModel(3L, "USER", true);

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(false);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.createUser(request));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    // =========================================================
    // UPDATE USER
    // =========================================================
    @Test
    void shouldUpdateUserSuccessfully() {

        UpdateUserRequest request = mock(UpdateUserRequest.class);

        when(request.getUsername()).thenReturn("ana");
        when(request.getEmail()).thenReturn("ana@example.com");
        when(request.getFirstName()).thenReturn("Ana");
        when(request.getLastName()).thenReturn("Garcia");
        when(request.isEnabled()).thenReturn(true);
        when(request.getRoleId()).thenReturn(3L);
        when(request.getDepartmentId()).thenReturn(2L);

        RoleModel oldRol = new RoleModel(1L, "ADMIN", true);

        DepartmentModel oldDepartment = new DepartmentModel(1L, "IT", true);

        UserModel existingUser = new UserModel(
                1L,
                "oldUsername",
                "old@example.com",
                "encodedPassword",
                "Old",
                "User",
                true,
                oldRol,
                oldDepartment);

        RoleModel newRol = new RoleModel(3L, "USER", true);

        DepartmentModel newDepartment = new DepartmentModel(2L, "Finance", true);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(existingUser));

        when(userRepository.existsByUsername("ana"))
                .thenReturn(false);

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(false);

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(newRol));

        when(departmentRepository.findById(2L))
                .thenReturn(Optional.of(newDepartment));

        when(userRepository.save(any(UserModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUser(request, 1L);

        assertEquals("ana", response.getUsername());
        assertEquals("ana@example.com", response.getEmail());
        assertEquals("Ana", response.getFirstName());
        assertEquals("Garcia", response.getLastName());
        assertEquals("USER", response.getRole().getName());
        assertEquals("Finance", response.getDepartment().getName());

        verify(userRepository)
                .save(existingUser);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingUser() {

        UpdateUserRequest request = mock(UpdateUserRequest.class);

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateUser(request, 99L));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingWithExistingUsername() {

        UpdateUserRequest request = mock(UpdateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        RoleModel role = new RoleModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(2L, "Finance", true);

        UserModel existingUser = new UserModel(
                1L,
                "oldUsername",
                "old@example.com",
                "encodedPassword",
                "Old",
                "User",
                true,
                role,
                department);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(existingUser));

        when(userRepository.existsByUsername("ana"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> userService.updateUser(request, 1L));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingWithExistingEmail() {

        UpdateUserRequest request = mock(UpdateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        RoleModel role = new RoleModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(2L, "Finance", true);

        UserModel existingUser = new UserModel(
                1L,
                "ana",
                "old@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                role,
                department);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(existingUser));

        when(userRepository.existsByEmail("ana@example.com"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> userService.updateUser(request, 1L));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenRoleDoesNotExistOnUpdate() {

        UpdateUserRequest request = mock(UpdateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(request.getRoleId())
                .thenReturn(99L);

        RoleModel role = new RoleModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(2L, "Finance", true);

        UserModel existingUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                role,
                department);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(existingUser));

        when(rolRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateUser(request, 1L));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void shouldThrowExceptionWhenDepartmentDoesNotExistOnUpdate() {

        UpdateUserRequest request = mock(UpdateUserRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getEmail())
                .thenReturn("ana@example.com");

        when(request.getRoleId())
                .thenReturn(3L);

        when(request.getDepartmentId())
                .thenReturn(99L);

        RoleModel role = new RoleModel(3L, "USER", true);

        DepartmentModel department = new DepartmentModel(2L, "Finance", true);

        UserModel existingUser = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                role,
                department);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(existingUser));

        when(rolRepository.findById(3L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateUser(request, 1L));

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

   
}