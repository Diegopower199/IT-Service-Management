package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.back_end.model.RoleModel;

public interface RoleRepository extends JpaRepository<RoleModel, Long> {

    @Query("SELECT r FROM RoleModel r ORDER BY r.idRole ASC")
    List<RoleModel> findAllOrderedById();
}
