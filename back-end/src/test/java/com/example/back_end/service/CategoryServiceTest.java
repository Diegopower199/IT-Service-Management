package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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

import com.example.back_end.dtos.category.CategoryRequest;
import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.repository.CategoryRepository;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    // =========================================================
    // GET ALL CATEGORIES
    // =========================================================
    @Test
    void shouldReturnAllCategories() {
        CategoryModel category1 = new CategoryModel(1L, "Hardware", true);
        CategoryModel category2 = new CategoryModel(2L, "Software", true);

        List<CategoryModel> categories = List.of(category1, category2);

        when(categoryRepository.findAllOrderedById())
                .thenReturn(categories);

        List<CategoryResponse> response = categoryService.getAllCategories();

        assertEquals(2, response.size());
        assertEquals("Hardware", response.get(0).getName());
        assertEquals("Software", response.get(1).getName());
    }

    @Test
    void shouldReturnEmptyListWhenNoCategoriesExist() {
        when(categoryRepository.findAllOrderedById())
                .thenReturn(List.of());

        List<CategoryResponse> response = categoryService.getAllCategories();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET ACTIVE CATEGORIES
    // =========================================================
    @Test
    void shouldReturnActiveCategories() {
        CategoryModel category1 = new CategoryModel(1L, "Hardware", true);
        CategoryModel category2 = new CategoryModel(2L, "Software", true);

        List<CategoryModel> categories = List.of(category1, category2);

        when(categoryRepository.findByActiveTrueOrderByIdCategoryAsc())
                .thenReturn(categories);

        List<CategoryResponse> response = categoryService.getActiveCategories();

        assertEquals(2, response.size());
        assertEquals("Hardware", response.get(0).getName());
        assertEquals("Software", response.get(1).getName());
        assertTrue(response.get(0).isActive());
        assertTrue(response.get(1).isActive());
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveCategoriesExist() {
        when(categoryRepository.findByActiveTrueOrderByIdCategoryAsc())
                .thenReturn(List.of());

        List<CategoryResponse> response = categoryService.getActiveCategories();

        assertTrue(response.isEmpty());
    }

    // =========================================================
    // GET CATEGORY BY ID
    // =========================================================
    @Test
    void shouldReturnCategoryById() {
        CategoryModel category = new CategoryModel(1L, "Hardware", true);

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        CategoryResponse response = categoryService.getCategoryById(1L);

        assertEquals(1L, response.getIdCategory());
        assertEquals("Hardware", response.getName());
        assertTrue(response.isActive());
    }

    @Test
    void shouldThrowExceptionWhenCategoryByIdDoesNotExist() {
        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.getCategoryById(99L));
    }

    // =========================================================
    // CREATE CATEGORY
    // =========================================================
    @Test
    void shouldCreateCategorySuccessfully() {

        CategoryRequest request = new CategoryRequest("Hardware");

        CategoryModel savedCategory = new CategoryModel(1L, "Hardware", true);

        when(categoryRepository.existsByName("Hardware"))
                .thenReturn(false);

        when(categoryRepository.save(any(CategoryModel.class)))
                .thenReturn(savedCategory);

        CategoryResponse response = categoryService.createCategory(request);

        assertEquals(1L, response.getIdCategory());
        assertEquals("Hardware", response.getName());
        assertTrue(response.isActive());

        verify(categoryRepository).existsByName("Hardware");
        verify(categoryRepository).save(any(CategoryModel.class));
    }

    @Test
    void shouldThrowExceptionWhenCategoryAlreadyExists() {

        CategoryRequest request = new CategoryRequest("Hardware");

        when(categoryRepository.existsByName("Hardware"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> categoryService.createCategory(request));

        verify(categoryRepository).existsByName("Hardware");
        verify(categoryRepository, never())
                .save(any(CategoryModel.class));
    }

    // =========================================================
    // UPDATE CATEGORY
    // =========================================================
    @Test
    void shouldUpdateCategorySuccessfully() {

        CategoryRequest request = new CategoryRequest("Peripherals");

        CategoryModel existingCategory = new CategoryModel(1L, "Hardware", true);

        CategoryModel updatedCategory = new CategoryModel(1L, "Peripherals", true);

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.existsByName("Peripherals"))
                .thenReturn(false);

        when(categoryRepository.save(any(CategoryModel.class)))
                .thenReturn(updatedCategory);

        CategoryResponse response = categoryService.updateCategory(request, 1L);

        assertEquals(1L, response.getIdCategory());
        assertEquals("Peripherals", response.getName());
        assertTrue(response.isActive());

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).existsByName("Peripherals");
        verify(categoryRepository).save(any(CategoryModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingCategory() {

        CategoryRequest request = new CategoryRequest("Peripherals");

        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.updateCategory(request, 99L));

        verify(categoryRepository).findById(99L);

        verify(categoryRepository, never())
                .save(any(CategoryModel.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingCategoryWithExistingName() {

        CategoryRequest request = new CategoryRequest("Software");

        CategoryModel existingCategory = new CategoryModel(1L, "Hardware", true);

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.existsByName("Software"))
                .thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () -> categoryService.updateCategory(request, 1L));

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).existsByName("Software");

        verify(categoryRepository, never())
                .save(any(CategoryModel.class));
    }

    // =========================================================
    // DEACTIVATE CATEGORY
    // =========================================================
    @Test
    void shouldDeactivateCategorySuccessfully() {

        CategoryModel category = new CategoryModel(1L, "Hardware", true);

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        when(categoryRepository.save(any(CategoryModel.class)))
                .thenReturn(category);

        categoryService.deactivateCategory(1L);

        assertFalse(category.isActive());

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).save(category);
    }

    @Test
    void shouldThrowExceptionWhenDeactivatingNonExistingCategory() {

        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.deactivateCategory(99L));

        verify(categoryRepository).findById(99L);

        verify(categoryRepository, never())
                .save(any(CategoryModel.class));
    }

    // =========================================================
    // ACTIVATE CATEGORY
    // =========================================================
    @Test
    void shouldActivateCategorySuccessfully() {

        CategoryModel category = new CategoryModel(1L, "Hardware", false);

        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        when(categoryRepository.save(any(CategoryModel.class)))
                .thenReturn(category);

        categoryService.activateCategory(1L);

        assertTrue(category.isActive());

        verify(categoryRepository).findById(1L);
        verify(categoryRepository).save(category);
    }

    @Test
    void shouldThrowExceptionWhenActivatingNonExistingCategory() {

        when(categoryRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.activateCategory(99L));

        verify(categoryRepository).findById(99L);

        verify(categoryRepository, never())
                .save(any(CategoryModel.class));
    }
}
