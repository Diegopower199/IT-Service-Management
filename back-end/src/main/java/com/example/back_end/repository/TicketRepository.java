package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;

public interface TicketRepository extends JpaRepository<TicketModel, Long> {
    List<TicketModel> findByCreatedByOrRequestedFor(
            UserModel createdBy,
            UserModel requestedFor);
}