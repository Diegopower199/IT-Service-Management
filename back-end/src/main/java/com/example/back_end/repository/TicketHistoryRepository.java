package com.example.back_end.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.TicketHistoryModel;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistoryModel, Long> {

}