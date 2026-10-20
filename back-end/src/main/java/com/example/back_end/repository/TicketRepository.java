package com.example.back_end.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;

public interface TicketRepository extends JpaRepository<TicketModel, Long> {
    Page<TicketModel> findByCreatedByOrRequestedFor(
            UserModel createdBy,
            UserModel requestedFor,
            Pageable pageable);
}