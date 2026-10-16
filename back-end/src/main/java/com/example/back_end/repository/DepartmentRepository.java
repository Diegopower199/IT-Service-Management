package com.example.back_end.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.DepartmentModel;

public interface DepartmentRepository extends JpaRepository<DepartmentModel, Long> {

    boolean existsByName(String name);

    @Query("SELECT d FROM DepartmentModel d ORDER BY d.idDepartment ASC")
    List<DepartmentModel> findAllOrderedById();

    List<DepartmentModel> findByActiveTrueOrderByIdDepartmentAsc();

    Optional<DepartmentModel> findByIdDepartmentAndActiveTrue(
            Long idDepartment);
}
