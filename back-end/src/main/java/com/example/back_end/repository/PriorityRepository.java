package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.PriorityModel;

public interface PriorityRepository extends JpaRepository<PriorityModel, Long> {

    boolean existsByName(String name);

    @Query("SELECT p FROM PriorityModel p ORDER BY p.idPriority ASC")
    List<PriorityModel> findAllOrderedById();
}
