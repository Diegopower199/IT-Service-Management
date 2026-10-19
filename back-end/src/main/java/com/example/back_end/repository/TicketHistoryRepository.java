package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.TicketHistoryModel;
import com.example.back_end.model.TicketModel;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistoryModel, Long> {
    List<TicketHistoryModel> findByTicketOrderByCreatedAtAsc(TicketModel ticket);
}