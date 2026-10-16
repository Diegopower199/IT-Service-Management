package com.example.back_end.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.RolModel;

public interface RolRepository extends JpaRepository<RolModel, Long> {

    boolean existsByName(String name);

    @Query("SELECT r FROM RolModel r ORDER BY r.idRol ASC")
    List<RolModel> findAllOrderedById();

    List<RolModel> findByActiveTrueOrderByIdRolAsc();

    Optional<RolModel> findByIdRolAndActiveTrue(Long idRol);
}
