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

import com.example.back_end.dtos.category.CategoryRequest;
import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.service.CategoryService;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    @Mock
    private CategoryService categoryService;

    @Mock
    private CategoryRequest categoryRequest;

    @Mock
    private CategoryResponse categoryResponse;

    @InjectMocks
    private CategoryController categoryController;

    @Test
    void getAllCategoriesShouldReturnAllCategories() {

        List<CategoryResponse> categories = List.of(categoryResponse);

        when(categoryService.getAllCategories())
                .thenReturn(categories);

        ResponseEntity<List<CategoryResponse>> response = categoryController.getAllCategories();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(categories);

        verify(categoryService).getAllCategories();
    }

    @Test
    void getActiveCategoriesShouldReturnActiveCategories() {

        List<CategoryResponse> categories = List.of(categoryResponse);

        when(categoryService.getActiveCategories())
                .thenReturn(categories);

        ResponseEntity<List<CategoryResponse>> response = categoryController.getActiveCategories();

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(categories);

        verify(categoryService).getActiveCategories();
    }

    @Test
    void getCategoryByIdShouldReturnCategory() {

        Long categoryId = 1L;

        when(categoryService.getCategoryById(categoryId))
                .thenReturn(categoryResponse);

        ResponseEntity<CategoryResponse> response = categoryController.getCategoryById(categoryId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(categoryResponse);

        verify(categoryService).getCategoryById(categoryId);
    }

    @Test
    void createCategoryShouldReturnCreatedCategory() {

        when(categoryService.createCategory(categoryRequest))
                .thenReturn(categoryResponse);

        ResponseEntity<CategoryResponse> response = categoryController.createCategory(categoryRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        assertThat(response.getBody())
                .isSameAs(categoryResponse);

        verify(categoryService).createCategory(categoryRequest);
    }

    @Test
    void updateCategoryShouldReturnUpdatedCategory() {

        Long categoryId = 1L;

        when(categoryService.updateCategory(categoryRequest, categoryId))
                .thenReturn(categoryResponse);

        ResponseEntity<CategoryResponse> response = categoryController.updateCategory(
                categoryId,
                categoryRequest);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(categoryResponse);

        verify(categoryService).updateCategory(
                categoryRequest,
                categoryId);
    }

    @Test
    void deactivateCategoryShouldReturnNoContent() {

        Long categoryId = 1L;

        ResponseEntity<Void> response = categoryController.deactivateCategory(categoryId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(categoryService).deactivateCategory(categoryId);
    }

    @Test
    void activateCategoryShouldReturnNoContent() {

        Long categoryId = 1L;

        ResponseEntity<Void> response = categoryController.activateCategory(categoryId);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        verify(categoryService).activateCategory(categoryId);
    }
}