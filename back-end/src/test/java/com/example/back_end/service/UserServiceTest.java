package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.back_end.dtos.user.ChangePasswordRequest;
import com.example.back_end.dtos.user.CreateUserRequest;
import com.example.back_end.dtos.user.UpdateProfileRequest;
import com.example.back_end.dtos.user.UpdateUserRequest;
import com.example.back_end.dtos.user.UserResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.RoleName;
import com.example.back_end.exception.InvalidPasswordException;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RoleModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.DepartmentRepository;
import com.example.back_end.repository.RoleRepository;
import com.example.back_end.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Pageable pageable;

    @Mock
    private CreateUserRequest createUserRequest;

    @Mock
    private UpdateUserRequest updateUserRequest;

    @Mock
    private UpdateProfileRequest updateProfileRequest;

    @Mock
    private ChangePasswordRequest changePasswordRequest;

    @InjectMocks
    private UserService userService;

    @Test
    void getAllUsersShouldReturnMappedUsers() {

        UserModel user = createUser(
                1L,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                createRole(1L, RoleName.USER.name()),
                createDepartment(1L, "IT"));

        when(userRepository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(user)));

        Page<UserResponse> result = userService.getAllUsers(pageable);

        assertThat(result.getContent())
                .hasSize(1);

        UserResponse response = result.getContent().get(0);

        assertThat(response.getIdUser())
                .isEqualTo(1L);

        assertThat(response.getUsername())
                .isEqualTo("john");

        assertThat(response.getEmail())
                .isEqualTo("john@example.com");

        assertThat(response.getFirstName())
                .isEqualTo("John");

        assertThat(response.getLastName())
                .isEqualTo("Doe");

        assertThat(response.isEnabled())
                .isTrue();

        assertThat(response.getRole().getName())
                .isEqualTo(RoleName.USER.name());

        assertThat(response.getDepartment().getName())
                .isEqualTo("IT");

        verify(userRepository).findAll(pageable);
    }

    @Test
    void getUserByIdShouldReturnUser() {

        Long userId = 1L;

        UserModel user = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                createRole(1L, RoleName.USER.name()),
                createDepartment(1L, "IT"));

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        UserResponse result = userService.getUserById(userId);

        assertThat(result.getIdUser())
                .isEqualTo(userId);

        assertThat(result.getUsername())
                .isEqualTo("john");

        verify(userRepository).findById(userId);
    }

    @Test
    void getUserByIdShouldThrowExceptionWhenUserDoesNotExist() {

        Long userId = 1L;

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.getUserById(userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with id " + userId + " not found");

        verify(userRepository).findById(userId);
    }

    @Test
    void getCurrentUserShouldReturnUser() {

        String username = "john";

        UserModel user = createUser(
                1L,
                username,
                "john@example.com",
                "John",
                "Doe",
                true,
                createRole(1L, RoleName.USER.name()),
                createDepartment(1L, "IT"));

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(user));

        UserResponse result = userService.getCurrentUser(username);

        assertThat(result.getUsername())
                .isEqualTo(username);

        verify(userRepository).findByUsername(username);
    }

    @Test
    void getCurrentUserShouldThrowExceptionWhenUserDoesNotExist() {

        String username = "john";

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.getCurrentUser(username))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with username '" + username + "' not found");
    }

    @Test
    void createUserShouldCreateUser() {

        RoleModel role = createRole(1L, RoleName.USER.name());

        DepartmentModel department = createDepartment(1L, "IT");

        when(createUserRequest.getUsername())
                .thenReturn("john");

        when(createUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(createUserRequest.getPassword())
                .thenReturn("password");

        when(createUserRequest.getFirstName())
                .thenReturn("John");

        when(createUserRequest.getLastName())
                .thenReturn("Doe");

        when(createUserRequest.isEnabled())
                .thenReturn(true);

        when(createUserRequest.getRoleId())
                .thenReturn(1L);

        when(createUserRequest.getDepartmentId())
                .thenReturn(1L);

        when(userRepository.existsByUsername("john"))
                .thenReturn(false);

        when(userRepository.existsByEmail("john@example.com"))
                .thenReturn(false);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(passwordEncoder.encode("password"))
                .thenReturn("encoded-password");

        when(userRepository.save(any(UserModel.class)))
                .thenAnswer(invocation -> {

                    UserModel user = invocation.getArgument(0);

                    user.setIdUser(1L);

                    return user;
                });

        UserResponse result = userService.createUser(createUserRequest);

        ArgumentCaptor<UserModel> userCaptor = ArgumentCaptor.forClass(UserModel.class);

        verify(userRepository)
                .save(userCaptor.capture());

        UserModel savedUser = userCaptor.getValue();

        assertThat(savedUser.getUsername())
                .isEqualTo("john");

        assertThat(savedUser.getPassword())
                .isEqualTo("encoded-password");

        assertThat(savedUser.getEmail())
                .isEqualTo("john@example.com");

        assertThat(savedUser.getFirstName())
                .isEqualTo("John");

        assertThat(savedUser.getLastName())
                .isEqualTo("Doe");

        assertThat(savedUser.isEnabled())
                .isTrue();

        assertThat(savedUser.getRole())
                .isSameAs(role);

        assertThat(savedUser.getDepartment())
                .isSameAs(department);

        assertThat(result.getIdUser())
                .isEqualTo(1L);

        assertThat(result.getUsername())
                .isEqualTo("john");

        verify(passwordEncoder)
                .encode("password");
    }

    @Test
    void createUserShouldThrowExceptionWhenUsernameAlreadyExists() {

        when(createUserRequest.getUsername())
                .thenReturn("john");

        when(userRepository.existsByUsername("john"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> userService.createUser(createUserRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Username 'john' already exists");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void createUserShouldThrowExceptionWhenEmailAlreadyExists() {

        when(createUserRequest.getUsername())
                .thenReturn("john");

        when(createUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(userRepository.existsByUsername("john"))
                .thenReturn(false);

        when(userRepository.existsByEmail("john@example.com"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> userService.createUser(createUserRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Email 'john@example.com' already exists");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void createUserShouldThrowExceptionWhenRoleDoesNotExist() {

        when(createUserRequest.getUsername())
                .thenReturn("john");

        when(createUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(createUserRequest.getRoleId())
                .thenReturn(5L);

        when(userRepository.existsByUsername("john"))
                .thenReturn(false);

        when(userRepository.existsByEmail("john@example.com"))
                .thenReturn(false);

        when(roleRepository.findById(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.createUser(createUserRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Role with id 5 not found");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void createUserShouldThrowExceptionWhenDepartmentDoesNotExist() {

        RoleModel role = createRole(1L, RoleName.USER.name());

        when(createUserRequest.getUsername())
                .thenReturn("john");

        when(createUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(createUserRequest.getRoleId())
                .thenReturn(1L);

        when(createUserRequest.getDepartmentId())
                .thenReturn(5L);

        when(userRepository.existsByUsername("john"))
                .thenReturn(false);

        when(userRepository.existsByEmail("john@example.com"))
                .thenReturn(false);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.createUser(createUserRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Department with id 5 not found");

        verify(userRepository, never())
                .save(any(UserModel.class));
    }

    @Test
    void updateUserShouldUpdateUser() {

        Long userId = 1L;

        UserModel existingUser = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                createRole(1L, RoleName.USER.name()),
                createDepartment(1L, "IT"));

        RoleModel newRole = createRole(2L, RoleName.TECHNICIAN.name());

        DepartmentModel newDepartment = createDepartment(2L, "Support");

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(updateUserRequest.getUsername())
                .thenReturn("john2");

        when(updateUserRequest.getEmail())
                .thenReturn("john2@example.com");

        when(updateUserRequest.getFirstName())
                .thenReturn("Johnny");

        when(updateUserRequest.getLastName())
                .thenReturn("Doe");

        when(updateUserRequest.isEnabled())
                .thenReturn(true);

        when(updateUserRequest.getRoleId())
                .thenReturn(2L);

        when(updateUserRequest.getDepartmentId())
                .thenReturn(2L);

        when(userRepository.existsByUsername("john2"))
                .thenReturn(false);

        when(userRepository.existsByEmail("john2@example.com"))
                .thenReturn(false);

        when(roleRepository.findById(2L))
                .thenReturn(Optional.of(newRole));

        when(departmentRepository.findById(2L))
                .thenReturn(Optional.of(newDepartment));

        when(userRepository.save(existingUser))
                .thenReturn(existingUser);

        UserResponse result = userService.updateUser(
                updateUserRequest,
                userId);

        assertThat(existingUser.getUsername())
                .isEqualTo("john2");

        assertThat(existingUser.getEmail())
                .isEqualTo("john2@example.com");

        assertThat(existingUser.getFirstName())
                .isEqualTo("Johnny");

        assertThat(existingUser.getRole())
                .isSameAs(newRole);

        assertThat(existingUser.getDepartment())
                .isSameAs(newDepartment);

        assertThat(result.getUsername())
                .isEqualTo("john2");

        verify(userRepository)
                .save(existingUser);
    }

    @Test
    void updateUserShouldNotCheckDuplicatesWhenUsernameAndEmailDoNotChange() {

        Long userId = 1L;

        RoleModel role = createRole(1L, RoleName.USER.name());

        DepartmentModel department = createDepartment(1L, "IT");

        UserModel existingUser = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                role,
                department);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(updateUserRequest.getUsername())
                .thenReturn("john");

        when(updateUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(updateUserRequest.getFirstName())
                .thenReturn("John");

        when(updateUserRequest.getLastName())
                .thenReturn("Doe");

        when(updateUserRequest.isEnabled())
                .thenReturn(true);

        when(updateUserRequest.getRoleId())
                .thenReturn(1L);

        when(updateUserRequest.getDepartmentId())
                .thenReturn(1L);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(1L))
                .thenReturn(Optional.of(department));

        when(userRepository.save(existingUser))
                .thenReturn(existingUser);

        userService.updateUser(
                updateUserRequest,
                userId);

        verify(userRepository, never())
                .existsByUsername("john");

        verify(userRepository, never())
                .existsByEmail("john@example.com");
    }

    @Test
    void updateUserShouldThrowExceptionWhenUsernameAlreadyExists() {

        Long userId = 1L;

        UserModel existingUser = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(updateUserRequest.getUsername())
                .thenReturn("mary");

        when(userRepository.existsByUsername("mary"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> userService.updateUser(
                        updateUserRequest,
                        userId))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Username 'mary' already exists");

        verify(userRepository, never())
                .save(existingUser);
    }

    @Test
    void updateUserShouldThrowExceptionWhenEmailAlreadyExists() {

        Long userId = 1L;

        UserModel existingUser = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(updateUserRequest.getUsername())
                .thenReturn("john");

        when(updateUserRequest.getEmail())
                .thenReturn("mary@example.com");

        when(userRepository.existsByEmail("mary@example.com"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> userService.updateUser(
                        updateUserRequest,
                        userId))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Email 'mary@example.com' already exists");

        verify(userRepository, never())
                .save(existingUser);
    }

    @Test
    void updateUserShouldThrowExceptionWhenUserDoesNotExist() {

        Long userId = 1L;

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.updateUser(
                        updateUserRequest,
                        userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with id " + userId + " not found");
    }

    @Test
    void updateUserShouldThrowExceptionWhenRoleDoesNotExist() {

        Long userId = 1L;

        UserModel existingUser = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(updateUserRequest.getUsername())
                .thenReturn("john");

        when(updateUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(updateUserRequest.getRoleId())
                .thenReturn(5L);

        when(roleRepository.findById(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.updateUser(
                        updateUserRequest,
                        userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Role with id 5 not found");
    }

    @Test
    void updateUserShouldThrowExceptionWhenDepartmentDoesNotExist() {

        Long userId = 1L;

        RoleModel role = createRole(1L, RoleName.USER.name());

        UserModel existingUser = createUser(
                userId,
                "john",
                "john@example.com",
                "John",
                "Doe",
                true,
                role,
                null);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(updateUserRequest.getUsername())
                .thenReturn("john");

        when(updateUserRequest.getEmail())
                .thenReturn("john@example.com");

        when(updateUserRequest.getRoleId())
                .thenReturn(1L);

        when(updateUserRequest.getDepartmentId())
                .thenReturn(5L);

        when(roleRepository.findById(1L))
                .thenReturn(Optional.of(role));

        when(departmentRepository.findById(5L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.updateUser(
                        updateUserRequest,
                        userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Department with id 5 not found");
    }

    @Test
    void updateCurrentUserShouldUpdateProfile() {

        String username = "john";

        UserModel existingUser = createUser(
                1L,
                username,
                "john@example.com",
                "John",
                "Doe",
                true,
                createRole(1L, RoleName.USER.name()),
                createDepartment(1L, "IT"));

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(existingUser));

        when(updateProfileRequest.getEmail())
                .thenReturn("new@example.com");

        when(updateProfileRequest.getFirstName())
                .thenReturn("Johnny");

        when(updateProfileRequest.getLastName())
                .thenReturn("Doe");

        when(userRepository.existsByEmail("new@example.com"))
                .thenReturn(false);

        when(userRepository.save(existingUser))
                .thenReturn(existingUser);

        UserResponse result = userService.updateCurrentUser(
                username,
                updateProfileRequest);

        assertThat(existingUser.getEmail())
                .isEqualTo("new@example.com");

        assertThat(existingUser.getFirstName())
                .isEqualTo("Johnny");

        assertThat(result.getEmail())
                .isEqualTo("new@example.com");

        verify(userRepository)
                .save(existingUser);
    }

    @Test
    void updateCurrentUserShouldNotCheckDuplicateWhenEmailDoesNotChange() {

        String username = "john";

        UserModel existingUser = createUser(
                1L,
                username,
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(existingUser));

        when(updateProfileRequest.getEmail())
                .thenReturn("john@example.com");

        when(updateProfileRequest.getFirstName())
                .thenReturn("John");

        when(updateProfileRequest.getLastName())
                .thenReturn("Doe");

        when(userRepository.save(existingUser))
                .thenReturn(existingUser);

        userService.updateCurrentUser(
                username,
                updateProfileRequest);

        verify(userRepository, never())
                .existsByEmail("john@example.com");
    }

    @Test
    void updateCurrentUserShouldThrowExceptionWhenEmailAlreadyExists() {

        String username = "john";

        UserModel existingUser = createUser(
                1L,
                username,
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(existingUser));

        when(updateProfileRequest.getEmail())
                .thenReturn("mary@example.com");

        when(userRepository.existsByEmail("mary@example.com"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> userService.updateCurrentUser(
                        username,
                        updateProfileRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Email 'mary@example.com' already exists");

        verify(userRepository, never())
                .save(existingUser);
    }

    @Test
    void updateCurrentUserShouldThrowExceptionWhenUserDoesNotExist() {

        String username = "john";

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.updateCurrentUser(
                        username,
                        updateProfileRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with username '" + username + "' not found");
    }

    @Test
    void changePasswordShouldChangePassword() {

        String username = "john";

        UserModel user = createUser(
                1L,
                username,
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        user.setPassword("old-encoded-password");

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(user));

        when(changePasswordRequest.getCurrentPassword())
                .thenReturn("old-password");

        when(changePasswordRequest.getNewPassword())
                .thenReturn("new-password");

        when(passwordEncoder.matches(
                "old-password",
                "old-encoded-password"))
                .thenReturn(true);

        when(passwordEncoder.encode("new-password"))
                .thenReturn("new-encoded-password");

        userService.changePassword(
                username,
                changePasswordRequest);

        assertThat(user.getPassword())
                .isEqualTo("new-encoded-password");

        verify(passwordEncoder).matches(
                "old-password",
                "old-encoded-password");

        verify(passwordEncoder)
                .encode("new-password");

        verify(userRepository)
                .save(user);
    }

    @Test
    void changePasswordShouldThrowExceptionWhenCurrentPasswordIsIncorrect() {

        String username = "john";

        UserModel user = createUser(
                1L,
                username,
                "john@example.com",
                "John",
                "Doe",
                true,
                null,
                null);

        user.setPassword("encoded-password");

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(user));

        when(changePasswordRequest.getCurrentPassword())
                .thenReturn("wrong-password");

        when(passwordEncoder.matches(
                "wrong-password",
                "encoded-password"))
                .thenReturn(false);

        assertThatThrownBy(
                () -> userService.changePassword(
                        username,
                        changePasswordRequest))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessage(
                        "Current password is incorrect");

        verify(passwordEncoder, never())
                .encode(any());

        verify(userRepository, never())
                .save(user);
    }

    @Test
    void changePasswordShouldThrowExceptionWhenUserDoesNotExist() {

        String username = "john";

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> userService.changePassword(
                        username,
                        changePasswordRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "User with username '" + username + "' not found");

        verify(passwordEncoder, never())
                .matches(any(), any());
    }

    @Test
    void getAllTechniciansShouldReturnEnabledTechnicians() {

        UserModel firstTechnician = createUser(
                1L,
                "tech1",
                "tech1@example.com",
                "Tech",
                "One",
                true,
                createRole(2L, RoleName.TECHNICIAN.name()),
                null);

        UserModel secondTechnician = createUser(
                2L,
                "tech2",
                "tech2@example.com",
                "Tech",
                "Two",
                true,
                createRole(2L, RoleName.TECHNICIAN.name()),
                null);

        when(userRepository.findByRoleNameAndEnabledTrue(
                RoleName.TECHNICIAN.name()))
                .thenReturn(
                        List.of(
                                firstTechnician,
                                secondTechnician));

        List<UserSummaryResponse> result = userService.getAllTechnicians();

        assertThat(result)
                .hasSize(2);

        assertThat(result.get(0).getIdUser())
                .isEqualTo(1L);

        assertThat(result.get(0).getUsername())
                .isEqualTo("tech1");

        assertThat(result.get(1).getIdUser())
                .isEqualTo(2L);

        assertThat(result.get(1).getUsername())
                .isEqualTo("tech2");

        verify(userRepository)
                .findByRoleNameAndEnabledTrue(
                        RoleName.TECHNICIAN.name());
    }

    private UserModel createUser(
            Long id,
            String username,
            String email,
            String firstName,
            String lastName,
            boolean enabled,
            RoleModel role,
            DepartmentModel department) {

        UserModel user = new UserModel();

        user.setIdUser(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(enabled);
        user.setRole(role);
        user.setDepartment(department);

        return user;
    }

    private RoleModel createRole(
            Long id,
            String name) {

        RoleModel role = new RoleModel();

        role.setIdRole(id);
        role.setName(name);

        return role;
    }

    private DepartmentModel createDepartment(
            Long id,
            String name) {

        DepartmentModel department = new DepartmentModel();

        department.setIdDepartment(id);
        department.setName(name);
        department.setActive(true);

        return department;
    }
}