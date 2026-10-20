package com.example.back_end.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.TicketCommentModel;
import com.example.back_end.model.TicketModel;

@Repository
public interface TicketCommentRepository
        extends JpaRepository<TicketCommentModel, Long> {

    Page<TicketCommentModel> findByTicket(
            TicketModel ticket,
            Pageable pageable);

    Page<TicketCommentModel> findByTicketAndInternalFalse(
            TicketModel ticket,
            Pageable pageable);
}