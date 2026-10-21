package com.example.back_end.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;

public interface TicketRepository extends JpaRepository<TicketModel, Long> {
    Page<TicketModel> findByCreatedByOrRequestedFor(
            UserModel createdBy,
            UserModel requestedFor,
            Pageable pageable);

    Page<TicketModel> findByAssignedTo(
            UserModel assignedTo,
            Pageable pageable);

    // =========================================================
    // USER STATISTICS
    // =========================================================

    @Query("""
            SELECT COUNT(t)
            FROM TicketModel t
            WHERE t.createdBy = :user
               OR t.requestedFor = :user
            """)
    long countRelatedToUser(
            @Param("user") UserModel user);

    @Query("""
            SELECT COUNT(t)
            FROM TicketModel t
            WHERE (t.createdBy = :user
               OR t.requestedFor = :user)
              AND t.status.name = :status
            """)
    long countRelatedToUserByStatus(
            @Param("user") UserModel user,
            @Param("status") String status);

    @Query("""
            SELECT COUNT(t)
            FROM TicketModel t
            WHERE (t.createdBy = :user
               OR t.requestedFor = :user)
              AND t.priority.name = :priority
            """)
    long countRelatedToUserByPriority(
            @Param("user") UserModel user,
            @Param("priority") String priority);

    // =========================================================
    // TECHNICIAN STATISTICS
    // =========================================================

    long countByAssignedTo(
            UserModel assignedTo);

    long countByAssignedToAndStatus_Name(
            UserModel assignedTo,
            String status);

    long countByAssignedToAndPriority_Name(
            UserModel assignedTo,
            String priority);

    // =========================================================
    // ADMIN STATISTICS
    // =========================================================

    long countByStatus_Name(
            String status);

    long countByPriority_Name(
            String priority);
}