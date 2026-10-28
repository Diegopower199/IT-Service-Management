package com.example.back_end.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.RefreshTokenModel;
import com.example.back_end.model.UserModel;

@Repository
public interface RefreshTokenRepository
        extends JpaRepository<RefreshTokenModel, Long> {

    Optional<RefreshTokenModel> findByTokenHash(String tokenHash);

    List<RefreshTokenModel> findByUserAndRevokedFalse(UserModel user);
}
