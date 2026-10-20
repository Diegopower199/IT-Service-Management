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
import com.example.back_end.dtos.category.CategoryRequest;
import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.CategoryService;

@WebMvcTest(CategoryController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // GET ALL CATEGORIES
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnAllCategories() throws Exception {

        List<CategoryResponse> categories = List.of(
                new CategoryResponse(1L, "Hardware", true),
                new CategoryResponse(2L, "Software", true));

        when(categoryService.getAllCategories())
                .thenReturn(categories);

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].idCategory").value(1))
                .andExpect(jsonPath("$[0].name").value("Hardware"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].idCategory").value(2))
                .andExpect(jsonPath("$[1].name").value("Software"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(categoryService).getAllCategories();
    }

    // =========================================================
    // GET ACTIVE CATEGORIES
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnActiveCategories() throws Exception {

        List<CategoryResponse> categories = List.of(
                new CategoryResponse(1L, "Hardware", true),
                new CategoryResponse(2L, "Software", true));

        when(categoryService.getActiveCategories())
                .thenReturn(categories);

        mockMvc.perform(get("/categories/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Hardware"))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[1].name").value("Software"))
                .andExpect(jsonPath("$[1].active").value(true));

        verify(categoryService).getActiveCategories();
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnEmptyListWhenNoActiveCategoriesExist() throws Exception {

        when(categoryService.getActiveCategories())
                .thenReturn(List.of());

        mockMvc.perform(get("/categories/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(categoryService).getActiveCategories();
    }

    // =========================================================
    // GET CATEGORY BY ID
    // =========================================================
    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldReturnCategoryById() throws Exception {

        CategoryResponse category = new CategoryResponse(1L, "Hardware", true);

        when(categoryService.getCategoryById(1L))
                .thenReturn(category);

        mockMvc.perform(get("/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCategory").value(1))
                .andExpect(jsonPath("$.name").value("Hardware"))
                .andExpect(jsonPath("$.active").value(true));

        verify(categoryService).getCategoryById(1L);
    }

    // =========================================================
    // CREATE CATEGORY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToCreateCategory() throws Exception {

        CategoryResponse response = new CategoryResponse(1L, "Hardware", true);

        when(categoryService.createCategory(
                any(CategoryRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Hardware"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCategory").value(1))
                .andExpect(jsonPath("$.name").value("Hardware"))
                .andExpect(jsonPath("$.active").value(true));

        verify(categoryService)
                .createCategory(any(CategoryRequest.class));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromCreatingCategory() throws Exception {

        mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Hardware"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .createCategory(any(CategoryRequest.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromCreatingCategory() throws Exception {

        mockMvc.perform(
                post("/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Hardware"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .createCategory(any(CategoryRequest.class));
    }

    // =========================================================
    // UPDATE CATEGORY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToUpdateCategory() throws Exception {

        CategoryResponse response = new CategoryResponse(1L, "Peripherals", true);

        when(categoryService.updateCategory(
                any(CategoryRequest.class),
                eq(1L)))
                .thenReturn(response);

        mockMvc.perform(
                put("/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Peripherals"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCategory").value(1))
                .andExpect(jsonPath("$.name").value("Peripherals"))
                .andExpect(jsonPath("$.active").value(true));

        verify(categoryService)
                .updateCategory(
                        any(CategoryRequest.class),
                        eq(1L));
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromUpdatingCategory() throws Exception {

        mockMvc.perform(
                put("/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Peripherals"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .updateCategory(
                        any(CategoryRequest.class),
                        any(Long.class));
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromUpdatingCategory() throws Exception {

        mockMvc.perform(
                put("/categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Peripherals"
                                }
                                """))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .updateCategory(
                        any(CategoryRequest.class),
                        any(Long.class));
    }

    // =========================================================
    // DEACTIVATE CATEGORY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToDeactivateCategory() throws Exception {

        mockMvc.perform(
                patch("/categories/1/deactivate"))
                .andExpect(status().isNoContent());

        verify(categoryService)
                .deactivateCategory(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromDeactivatingCategory() throws Exception {

        mockMvc.perform(
                patch("/categories/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .deactivateCategory(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromDeactivatingCategory() throws Exception {

        mockMvc.perform(
                patch("/categories/1/deactivate"))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .deactivateCategory(1L);
    }

    // =========================================================
    // ACTIVATE CATEGORY
    // =========================================================
    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldAllowAdminToActivateCategory() throws Exception {

        mockMvc.perform(
                patch("/categories/1/activate"))
                .andExpect(status().isNoContent());

        verify(categoryService)
                .activateCategory(1L);
    }

    @Test
    @WithMockUser(username = "user", roles = "USER")
    void shouldForbidUserFromActivatingCategory() throws Exception {

        mockMvc.perform(
                patch("/categories/1/activate"))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .activateCategory(1L);
    }

    @Test
    @WithMockUser(username = "technician", roles = "TECHNICIAN")
    void shouldForbidTechnicianFromActivatingCategory() throws Exception {

        mockMvc.perform(
                patch("/categories/1/activate"))
                .andExpect(status().isForbidden());

        verify(categoryService, never())
                .activateCategory(1L);
    }
}