package com.example.back_end.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.back_end.model.TicketHistoryModel;
import com.example.back_end.model.TicketModel;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistoryModel, Long> {
    Page<TicketHistoryModel> findByTicket(
            TicketModel ticket,
            Pageable pageable);

    @Query("""
            select history from TicketHistoryModel history
            join history.ticket ticket
            left join ticket.assignedTo technician
            where technician.idUser = :technicianId or ticket.assignedTo is null
            """)
    Page<TicketHistoryModel> findReadableByTechnician(@Param("technicianId") Long technicianId, Pageable pageable);
}
