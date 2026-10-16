package com.example.back_end.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.CategoryModel;

public interface CategoryRepository extends JpaRepository<CategoryModel, Long> {

    boolean existsByName(String name);

    @Query("SELECT c FROM CategoryModel c ORDER BY c.idCategory ASC")
    List<CategoryModel> findAllOrderedById();

    List<CategoryModel> findByActiveTrueOrderByIdCategoryAsc();

    Optional<CategoryModel> findByIdCategoryAndActiveTrue(Long idCategory);
}
