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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.back_end.dtos.department.DepartmentRequest;
import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.service.DepartmentService;

@ExtendWith(MockitoExtension.class)
class DepartmentControllerTest {

    @Mock
    private DepartmentService departmentService;

    @Mock
    private DepartmentRequest departmentRequest;

    @Mock
    private DepartmentResponse departmentResponse;

    @InjectMocks
    private DepartmentController departmentController;

    @Test
    void getAllDepartmentsShouldReturnAllDepartments() {

        List<DepartmentResponse> departments = List.of(departmentResponse);

        when(departmentService.getAllDepartments())
                .thenReturn(departments);

        ResponseEntity<List<DepartmentResponse>> response = departmentController.getAllDepartments();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(departments);

        verify(departmentService).getAllDepartments();
    }

    @Test
    void getActiveDepartmentsShouldReturnActiveDepartments() {

        List<DepartmentResponse> departments = List.of(departmentResponse);

        when(departmentService.getActiveDepartments())
                .thenReturn(departments);

        ResponseEntity<List<DepartmentResponse>> response = departmentController.getActiveDepartments();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(departments);

        verify(departmentService).getActiveDepartments();
    }

    @Test
    void getDepartmentByIdShouldReturnDepartment() {

        Long departmentId = 1L;

        when(departmentService.getDepartmentById(departmentId))
                .thenReturn(departmentResponse);

        ResponseEntity<DepartmentResponse> response = departmentController.getDepartmentById(departmentId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(departmentResponse);

        verify(departmentService).getDepartmentById(departmentId);
    }

    @Test
    void createDepartmentShouldReturnCreatedDepartment() {

        when(departmentService.createDepartment(departmentRequest))
                .thenReturn(departmentResponse);

        ResponseEntity<DepartmentResponse> response = departmentController.createDepartment(departmentRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(departmentResponse);

        verify(departmentService).createDepartment(departmentRequest);
    }

    @Test
    void updateDepartmentShouldReturnUpdatedDepartment() {

        Long departmentId = 1L;

        when(departmentService.updateDepartment(
                departmentId,
                departmentRequest))
                .thenReturn(departmentResponse);

        ResponseEntity<DepartmentResponse> response = departmentController.updateDepartment(
                departmentId,
                departmentRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(departmentResponse);

        verify(departmentService).updateDepartment(
                departmentId,
                departmentRequest);
    }

    @Test
    void deactivateDepartmentShouldReturnNoContent() {

        Long departmentId = 1L;

        ResponseEntity<Void> response = departmentController.deactivateDepartment(departmentId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(departmentService).deactivateDepartment(departmentId);
    }

    @Test
    void activateDepartmentShouldReturnNoContent() {

        Long departmentId = 1L;

        ResponseEntity<Void> response = departmentController.activateDepartment(departmentId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(departmentService).activateDepartment(departmentId);
    }
}