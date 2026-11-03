package com.example.back_end.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.example.back_end.dtos.user.ChangePasswordRequest;
import com.example.back_end.dtos.user.CreateUserRequest;
import com.example.back_end.dtos.user.UpdateProfileRequest;
import com.example.back_end.dtos.user.UpdateUserRequest;
import com.example.back_end.dtos.user.UserResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.service.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private Pageable pageable;

    @Mock
    private Page<UserResponse> userPage;

    @Mock
    private UserResponse userResponse;

    @Mock
    private UserSummaryResponse userSummaryResponse;

    @Mock
    private CreateUserRequest createUserRequest;

    @Mock
    private UpdateUserRequest updateUserRequest;

    @Mock
    private UpdateProfileRequest updateProfileRequest;

    @Mock
    private ChangePasswordRequest changePasswordRequest;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserController userController;

    @Test
    void getAllUsersShouldReturnUsersPage() {

        when(userService.getAllUsers(pageable))
                .thenReturn(userPage);

        ResponseEntity<Page<UserResponse>> response = userController.getAllUsers(pageable);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(userPage);

        verify(userService).getAllUsers(pageable);
    }

    @Test
    void getUserByIdShouldReturnUser() {

        Long userId = 1L;

        when(userService.getUserById(userId))
                .thenReturn(userResponse);

        ResponseEntity<UserResponse> response = userController.getUserById(userId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(userResponse);

        verify(userService).getUserById(userId);
    }

    @Test
    void getCurrentUserShouldReturnAuthenticatedUser() {

        String username = "john";

        when(authentication.getName())
                .thenReturn(username);

        when(userService.getCurrentUser(username))
                .thenReturn(userResponse);

        ResponseEntity<UserResponse> response = userController.getCurrentUser(authentication);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(userResponse);

        verify(authentication).getName();

        verify(userService).getCurrentUser(username);
    }

    @Test
    void createUserShouldReturnCreatedUser() {

        when(userService.createUser(createUserRequest))
                .thenReturn(userResponse);

        ResponseEntity<UserResponse> response = userController.createUser(createUserRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(userResponse);

        verify(userService).createUser(createUserRequest);
    }

    @Test
    void updateUserShouldReturnUpdatedUser() {

        Long userId = 1L;

        when(userService.updateUser(
                updateUserRequest,
                userId))
                .thenReturn(userResponse);

        ResponseEntity<UserResponse> response = userController.updateUser(
                userId,
                updateUserRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(userResponse);

        verify(userService).updateUser(
                updateUserRequest,
                userId);
    }

    @Test
    void updateCurrentUserShouldReturnUpdatedUser() {

        String username = "john";

        when(authentication.getName())
                .thenReturn(username);

        when(userService.updateCurrentUser(
                username,
                updateProfileRequest))
                .thenReturn(userResponse);

        ResponseEntity<UserResponse> response = userController.updateCurrentUser(
                authentication,
                updateProfileRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(userResponse);

        verify(authentication).getName();

        verify(userService).updateCurrentUser(
                username,
                updateProfileRequest);
    }

    @Test
    void changePasswordShouldReturnNoContent() {

        String username = "john";

        when(authentication.getName())
                .thenReturn(username);

        ResponseEntity<Void> response = userController.changePassword(
                authentication,
                changePasswordRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(authentication).getName();

        verify(userService).changePassword(
                username,
                changePasswordRequest);
    }

    @Test
    void getAllTechniciansShouldReturnTechnicians() {

        List<UserSummaryResponse> technicians = List.of(userSummaryResponse);

        when(userService.getAllTechnicians())
                .thenReturn(technicians);

        ResponseEntity<List<UserSummaryResponse>> response = userController.getAllTechnicians();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(technicians);

        verify(userService).getAllTechnicians();
    }
}