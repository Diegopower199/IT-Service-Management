package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.TicketAttachmentModel;

@Repository
public interface TicketAttachmentRepository
        extends JpaRepository<TicketAttachmentModel, Long> {

    @Query("""
                SELECT a
                FROM TicketAttachmentModel a
                WHERE a.ticket.idTicket = :ticketId
                ORDER BY a.createdAt DESC
            """)
    List<TicketAttachmentModel> findByTicketId(
            @Param("ticketId") Long ticketId);
}
