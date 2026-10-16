package com.example.back_end.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back_end.dtos.category.CategoryRequest;
import com.example.back_end.dtos.category.CategoryResponse;
import com.example.back_end.exception.ResourceAlreadyExistsException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.CategoryModel;
import com.example.back_end.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {

        List<CategoryModel> categories = categoryRepository.findAllOrderedById();
        List<CategoryResponse> result = new ArrayList<>();

        for (CategoryModel category : categories) {
            result.add(convertToResponse(category));
        }

        return result;
    }

    public CategoryResponse getCategoryById(Long categoryId) {

        CategoryModel category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category with id " + categoryId + " not found"));

        return convertToResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Category '" + request.getName() + "' already exists");
        }

        CategoryModel newCategory = new CategoryModel();
        newCategory.setName(request.getName());

        CategoryModel savedCategory = categoryRepository.save(newCategory);

        return convertToResponse(savedCategory);
    }

    public CategoryResponse updateCategory(
            CategoryRequest request,
            Long categoryId) {

        CategoryModel existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category with id " + categoryId + " not found"));

        if (!existingCategory.getName().equals(request.getName())
                && categoryRepository.existsByName(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Category '" + request.getName() + "' already exists");
        }

        existingCategory.setName(request.getName());

        CategoryModel updatedCategory = categoryRepository.save(existingCategory);

        return convertToResponse(updatedCategory);
    }

    public void deleteCategory(Long categoryId) {

        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category with id " + categoryId + " not found"));

        categoryRepository.deleteById(categoryId);
    }

    private CategoryResponse convertToResponse(CategoryModel category) {

        return new CategoryResponse(
                category.getIdCategory(),
                category.getName());
    }
}
