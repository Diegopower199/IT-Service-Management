package com.example.back_end.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.back_end.model.UserModel;

public interface UserRepository extends JpaRepository<UserModel, Long> {
    Optional<UserModel> findByUsername(String username);

    List<UserModel> findAllByOrderByUsernameAsc();

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}