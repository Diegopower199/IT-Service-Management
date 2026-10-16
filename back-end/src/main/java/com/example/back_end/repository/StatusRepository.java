package com.example.back_end.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.StatusModel;

public interface StatusRepository extends JpaRepository<StatusModel, Long> {

    boolean existsByName(String name);

    Optional<StatusModel> findByName(String name);

    @Query("SELECT s FROM StatusModel s ORDER BY s.idStatus ASC")
    List<StatusModel> findAllOrderedById();

    List<StatusModel> findByActiveTrueOrderByIdStatusAsc();

    Optional<StatusModel> findByIdStatusAndActiveTrue(Long idStatus);
}