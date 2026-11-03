package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

import com.example.back_end.dtos.category.CategoryRequest;
import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.repository.CategoryRepository;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryRequest categoryRequest;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void getAllCategoriesShouldReturnAllCategories() {

        CategoryModel category = createCategory(
                1L,
                "Hardware",
                true);

        when(categoryRepository.findAllOrderedById())
                .thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdCategory())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("Hardware");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(categoryRepository).findAllOrderedById();
    }

    @Test
    void getActiveCategoriesShouldReturnActiveCategories() {

        CategoryModel category = createCategory(
                1L,
                "Software",
                true);

        when(categoryRepository.findByActiveTrueOrderByIdCategoryAsc())
                .thenReturn(List.of(category));

        List<CategoryResponse> result = categoryService.getActiveCategories();

        assertThat(result)
                .hasSize(1);

        assertThat(result.get(0).getIdCategory())
                .isEqualTo(1L);

        assertThat(result.get(0).getName())
                .isEqualTo("Software");

        assertThat(result.get(0).isActive())
                .isTrue();

        verify(categoryRepository)
                .findByActiveTrueOrderByIdCategoryAsc();
    }

    @Test
    void getCategoryByIdShouldReturnCategory() {

        Long categoryId = 1L;

        CategoryModel category = createCategory(
                categoryId,
                "Hardware",
                true);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        CategoryResponse result = categoryService.getCategoryById(categoryId);

        assertThat(result.getIdCategory())
                .isEqualTo(categoryId);

        assertThat(result.getName())
                .isEqualTo("Hardware");

        assertThat(result.isActive())
                .isTrue();

        verify(categoryRepository).findById(categoryId);
    }

    @Test
    void getCategoryByIdShouldThrowExceptionWhenCategoryDoesNotExist() {

        Long categoryId = 1L;

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> categoryService.getCategoryById(categoryId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Category with id " + categoryId + " not found");

        verify(categoryRepository).findById(categoryId);
    }

    @Test
    void createCategoryShouldCreateAndReturnCategory() {

        when(categoryRequest.getName())
                .thenReturn("Hardware");

        when(categoryRepository.existsByName("Hardware"))
                .thenReturn(false);

        when(categoryRepository.save(
                org.mockito.ArgumentMatchers.any(CategoryModel.class)))
                .thenAnswer(invocation -> {

                    CategoryModel category = invocation.getArgument(0);

                    category.setIdCategory(1L);

                    return category;
                });

        CategoryResponse result = categoryService.createCategory(categoryRequest);

        assertThat(result.getIdCategory())
                .isEqualTo(1L);

        assertThat(result.getName())
                .isEqualTo("Hardware");

        assertThat(result.isActive())
                .isTrue();

        ArgumentCaptor<CategoryModel> categoryCaptor = ArgumentCaptor.forClass(CategoryModel.class);

        verify(categoryRepository)
                .save(categoryCaptor.capture());

        CategoryModel savedCategory = categoryCaptor.getValue();

        assertThat(savedCategory.getName())
                .isEqualTo("Hardware");

        assertThat(savedCategory.isActive())
                .isTrue();

        verify(categoryRepository)
                .existsByName("Hardware");
    }

    @Test
    void createCategoryShouldThrowExceptionWhenCategoryAlreadyExists() {

        when(categoryRequest.getName())
                .thenReturn("Hardware");

        when(categoryRepository.existsByName("Hardware"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> categoryService.createCategory(categoryRequest))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Category 'Hardware' already exists");

        verify(categoryRepository)
                .existsByName("Hardware");

        verify(categoryRepository, never())
                .save(
                        org.mockito.ArgumentMatchers.any(
                                CategoryModel.class));
    }

    @Test
    void updateCategoryShouldUpdateCategory() {

        Long categoryId = 1L;

        CategoryModel existingCategory = createCategory(
                categoryId,
                "Hardware",
                true);

        when(categoryRequest.getName())
                .thenReturn("Software");

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.existsByName("Software"))
                .thenReturn(false);

        when(categoryRepository.save(existingCategory))
                .thenReturn(existingCategory);

        CategoryResponse result = categoryService.updateCategory(
                categoryRequest,
                categoryId);

        assertThat(result.getIdCategory())
                .isEqualTo(categoryId);

        assertThat(result.getName())
                .isEqualTo("Software");

        assertThat(result.isActive())
                .isTrue();

        verify(categoryRepository).findById(categoryId);

        verify(categoryRepository)
                .existsByName("Software");

        verify(categoryRepository)
                .save(existingCategory);
    }

    @Test
    void updateCategoryShouldNotCheckDuplicateWhenNameDoesNotChange() {

        Long categoryId = 1L;

        CategoryModel existingCategory = createCategory(
                categoryId,
                "Hardware",
                true);

        when(categoryRequest.getName())
                .thenReturn("Hardware");

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.save(existingCategory))
                .thenReturn(existingCategory);

        CategoryResponse result = categoryService.updateCategory(
                categoryRequest,
                categoryId);

        assertThat(result.getName())
                .isEqualTo("Hardware");

        verify(categoryRepository).findById(categoryId);

        verify(categoryRepository, never())
                .existsByName("Hardware");

        verify(categoryRepository)
                .save(existingCategory);
    }

    @Test
    void updateCategoryShouldThrowExceptionWhenNewNameAlreadyExists() {

        Long categoryId = 1L;

        CategoryModel existingCategory = createCategory(
                categoryId,
                "Hardware",
                true);

        when(categoryRequest.getName())
                .thenReturn("Software");

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.existsByName("Software"))
                .thenReturn(true);

        assertThatThrownBy(
                () -> categoryService.updateCategory(
                        categoryRequest,
                        categoryId))
                .isInstanceOf(ResourceAlreadyExistsException.class)
                .hasMessage(
                        "Category 'Software' already exists");

        verify(categoryRepository).findById(categoryId);

        verify(categoryRepository)
                .existsByName("Software");

        verify(categoryRepository, never())
                .save(existingCategory);
    }

    @Test
    void updateCategoryShouldThrowExceptionWhenCategoryDoesNotExist() {

        Long categoryId = 1L;

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> categoryService.updateCategory(
                        categoryRequest,
                        categoryId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Category with id " + categoryId + " not found");

        verify(categoryRepository).findById(categoryId);

        verify(categoryRepository, never())
                .save(
                        org.mockito.ArgumentMatchers.any(
                                CategoryModel.class));
    }

    @Test
    void deactivateCategoryShouldDeactivateCategory() {

        Long categoryId = 1L;

        CategoryModel category = createCategory(
                categoryId,
                "Hardware",
                true);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        categoryService.deactivateCategory(categoryId);

        assertThat(category.isActive())
                .isFalse();

        verify(categoryRepository).findById(categoryId);

        verify(categoryRepository).save(category);
    }

    @Test
    void deactivateCategoryShouldThrowExceptionWhenCategoryDoesNotExist() {

        Long categoryId = 1L;

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> categoryService.deactivateCategory(categoryId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Category with id " + categoryId + " not found");

        verify(categoryRepository).findById(categoryId);
    }

    @Test
    void activateCategoryShouldActivateCategory() {

        Long categoryId = 1L;

        CategoryModel category = createCategory(
                categoryId,
                "Hardware",
                false);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        categoryService.activateCategory(categoryId);

        assertThat(category.isActive())
                .isTrue();

        verify(categoryRepository).findById(categoryId);

        verify(categoryRepository).save(category);
    }

    @Test
    void activateCategoryShouldThrowExceptionWhenCategoryDoesNotExist() {

        Long categoryId = 1L;

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> categoryService.activateCategory(categoryId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage(
                        "Category with id " + categoryId + " not found");

        verify(categoryRepository).findById(categoryId);
    }

    private CategoryModel createCategory(
            Long id,
            String name,
            boolean active) {

        CategoryModel category = new CategoryModel();

        category.setIdCategory(id);
        category.setName(name);
        category.setActive(active);

        return category;
    }
}