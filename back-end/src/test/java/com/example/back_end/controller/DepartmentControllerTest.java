package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.department.DepartmentRequest;
import com.example.back_end.dtos.department.DepartmentResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.DepartmentService;

@WebMvcTest(DepartmentController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class DepartmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DepartmentService departmentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL DEPARTMENTS
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnAllDepartments() throws Exception {

        List<DepartmentResponse> departments = List.of(
                new DepartmentResponse(1L, "IT", true),
                new DepartmentResponse(2L, "Finance", true));

        when(departmentService.getAllDepartments())
                .thenReturn(departments);

        mockMvc.perform(get("/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idDepartment").value(1))
                .andExpect(jsonPath("$[0].name").value("IT"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].idDepartment").value(2))
                .andExpect(jsonPath("$[1].name").value("Finance"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(departmentService).getAllDepartments();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnNoContentWhenNoDepartmentsExist() throws Exception {

        when(departmentService.getAllDepartments())
                .thenReturn(List.of());

        mockMvc.perform(get("/departments"))
                .andExpect(status().isNoContent());

        verify(departmentService).getAllDepartments();
    }

    // =========================================================
    // GET ACTIVE DEPARTMENTS
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnActiveDepartments() throws Exception {

        List<DepartmentResponse> departments = List.of(
                new DepartmentResponse(1L, "IT", true),
                new DepartmentResponse(2L, "Finance", true));

        when(departmentService.getActiveDepartments())
                .thenReturn(departments);

        mockMvc.perform(get("/departments/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("IT"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].name").value("Finance"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(departmentService).getActiveDepartments();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnEmptyListWhenNoActiveDepartmentsExist()
            throws Exception {

        when(departmentService.getActiveDepartments())
                .thenReturn(List.of());

        mockMvc.perform(get("/departments/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(departmentService).getActiveDepartments();
    }

    // =========================================================
    // GET DEPARTMENT BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnDepartmentById() throws Exception {

        DepartmentResponse department = new DepartmentResponse(1L, "IT", true);

        when(departmentService.getDepartmentById(1L))
                .thenReturn(department);

        mockMvc.perform(get("/departments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDepartment").value(1))
                .andExpect(jsonPath("$.name").value("IT"))
                .andExpect(jsonPath("$.active").value(true));

        verify(departmentService).getDepartmentById(1L);
    }

    // =========================================================
    // CREATE DEPARTMENT
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateDepartment() throws Exception {

        DepartmentResponse response = new DepartmentResponse(1L, "IT", true);

        when(departmentService.createDepartment(
                any(DepartmentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "IT"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDepartment").value(1))
                .andExpect(jsonPath("$.name").value("IT"))
                .andExpect(jsonPath("$.active").value(true));

        verify(departmentService)
                .createDepartment(any(DepartmentRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingDepartment() throws Exception {

        mockMvc.perform(
                post("/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "IT"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .createDepartment(any(DepartmentRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingDepartment()
            throws Exception {

        mockMvc.perform(
                post("/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "IT"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .createDepartment(any(DepartmentRequest.class));
    }

    // =========================================================
    // UPDATE DEPARTMENT
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateDepartment() throws Exception {

        DepartmentResponse response = new DepartmentResponse(1L, "Finance", true);

        when(departmentService.updateDepartment(eq(1L),
                any(DepartmentRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                put("/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Finance"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDepartment").value(1))
                .andExpect(jsonPath("$.name").value("Finance"))
                .andExpect(jsonPath("$.active").value(true));

        verify(departmentService)
                .updateDepartment(eq(1L),
                        any(DepartmentRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingDepartment()
            throws Exception {

        mockMvc.perform(
                put("/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Finance"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .updateDepartment(any(Long.class),
                        any(DepartmentRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingDepartment()
            throws Exception {

        mockMvc.perform(
                put("/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Finance"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .updateDepartment(any(Long.class),
                        any(DepartmentRequest.class));
    }

    // =========================================================
    // DEACTIVATE DEPARTMENT
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToDeactivateDepartment()
            throws Exception {

        mockMvc.perform(
                patch("/departments/1/deactivate"))
                .andExpect(status().isNoContent());

        verify(departmentService)
                .deactivateDepartment(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromDeactivatingDepartment()
            throws Exception {

        mockMvc.perform(
                patch("/departments/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .deactivateDepartment(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromDeactivatingDepartment()
            throws Exception {

        mockMvc.perform(
                patch("/departments/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .deactivateDepartment(1L);
    }

    // =========================================================
    // ACTIVATE DEPARTMENT
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToActivateDepartment()
            throws Exception {

        mockMvc.perform(
                patch("/departments/1/activate"))
                .andExpect(status().isNoContent());

        verify(departmentService)
                .activateDepartment(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromActivatingDepartment()
            throws Exception {

        mockMvc.perform(
                patch("/departments/1/activate"))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .activateDepartment(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromActivatingDepartment()
            throws Exception {

        mockMvc.perform(
                patch("/departments/1/activate"))
                .andExpect(status().isForbidden());

        verify(departmentService, never())
                .activateDepartment(1L);
    }
}