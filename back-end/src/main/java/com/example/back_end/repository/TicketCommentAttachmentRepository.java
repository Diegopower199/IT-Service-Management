package com.example.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.back_end.model.TicketCommentAttachmentModel;

/**
 * Repository for managing comment attachment metadata in MySQL.
 *
 * Provides persistence operations and queries for attachments
 * associated with ticket comments.
 *
 * File contents are stored separately in MongoDB GridFS.
 */
public interface TicketCommentAttachmentRepository
        extends JpaRepository<TicketCommentAttachmentModel, Long> {

    /**
     * Retrieves all attachments associated with a specific comment,
     * ordered by creation date, newest first.
     *
     * @param commentId identifier of the ticket comment
     * @return list of attachments belonging to the comment
     */
    @Query("""
            SELECT a
            FROM TicketCommentAttachmentModel a
            WHERE a.ticketComment.idComment = :commentId
            ORDER BY a.createdAt DESC
            """)
    List<TicketCommentAttachmentModel> findByCommentId(
            @Param("commentId") Long commentId);
}
