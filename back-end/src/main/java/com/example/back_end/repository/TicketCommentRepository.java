package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.TicketCommentModel;
import com.example.back_end.model.TicketModel;

@Repository
public interface TicketCommentRepository
        extends JpaRepository<TicketCommentModel, Long> {

    List<TicketCommentModel> findByTicketOrderByCreatedAtAsc(TicketModel ticket);

    List<TicketCommentModel> findByTicketAndInternalFalseOrderByCreatedAtAsc(TicketModel ticket);
}
