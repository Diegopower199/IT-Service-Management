
package com.example.back_end.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a file attachment associated with a ticket comment.
 *
 * Stores attachment metadata and relationships in MySQL,
 * while the actual file content is stored in the MongoDB
 * GridFS "ticket_comment_files" bucket.
 *
 * Each attachment belongs to a single ticket comment and
 * is associated with the user who uploaded it.
 */
@Entity
@Table(name = "ticket_comment_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentAttachmentModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_attachment", nullable = false)
    private Long idAttachment;

    /**
     * Ticket comment to which this attachment belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ticket_comment", nullable = false, foreignKey = @ForeignKey(name = "fk_ticket_comment_attachments_comment"))
    private TicketCommentModel ticketComment;

    /**
     * User who uploaded the attachment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_uploaded_by", nullable = false, foreignKey = @ForeignKey(name = "fk_ticket_comment_attachments_user"))
    private UserModel uploadedBy;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /**
     * Identifier of the file stored in MongoDB GridFS.
     */
    @Column(name = "mongo_file_id", nullable = false, length = 24)
    private String mongoFileId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
