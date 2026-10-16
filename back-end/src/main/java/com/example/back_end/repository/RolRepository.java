package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.RolModel;

public interface RolRepository extends JpaRepository<RolModel, Long> {

    @Query("SELECT c FROM RolModel c ORDER BY c.idRol")
    List<RolModel> findAllOrderedById();

    boolean existsByName(String name);
}
