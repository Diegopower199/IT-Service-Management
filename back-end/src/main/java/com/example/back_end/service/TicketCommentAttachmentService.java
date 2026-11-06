package com.example.back_end.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.back_end.dtos.ticketCommentAttachment.TicketCommentAttachmentResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.GridFsBucketType;
import com.example.back_end.enums.RoleName;
import com.example.back_end.exception.InvalidOperationException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.TicketCommentAttachmentModel;
import com.example.back_end.model.TicketCommentModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketCommentAttachmentRepository;
import com.example.back_end.repository.TicketCommentRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Manages files attached to ticket comments.
 *
 * <p>
 * Attachment metadata and relations are stored in MySQL. File content is
 * stored in the {@link GridFsBucketType#COMMENT COMMENT} MongoDB GridFS bucket.
 * This service validates the ticket/comment relationship, access permissions,
 * comment visibility and file contents.
 * </p>
 *
 * <p>
 * Files may only be uploaded by the author of the associated comment.
 * Regular users cannot access attachments of internal comments, even when
 * they know an attachment identifier.
 * </p>
 *
 * <p>
 * MongoDB and MySQL do not share one transaction. If storing metadata fails,
 * a best-effort compensating MongoDB deletion is attempted. No user-facing
 * attachment deletion operation is provided.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class TicketCommentAttachmentService {

    /** Maximum supported file size (10 MiB). */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final TicketCommentAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MongoFileStorageService mongoFileStorageService;

    /**
     * Lists metadata of files attached to a comment, newest first.
     *
     * @param ticketId  identifier of the ticket
     * @param commentId identifier of the comment
     * @return attachment response DTOs
     * @throws ResourceNotFoundException if the ticket or comment is not found,
     *                                   or the comment belongs to another ticket
     * @throws AccessDeniedException     if the user cannot access the comment
     */
    @Transactional(readOnly = true)
    public List<TicketCommentAttachmentResponse> getAttachmentsByCommentId(
            Long ticketId, Long commentId) {

        UserModel currentUser = getAuthenticatedUser();
        getAccessibleComment(ticketId, commentId, currentUser);

        return attachmentRepository.findByCommentId(commentId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Uploads a file to a comment authored by the authenticated user.
     *
     * <p>
     * The file is validated and stored in MongoDB before its metadata is
     * inserted into MySQL. In case of a metadata persistence failure, the newly
     * uploaded file is removed from GridFS on a best-effort basis.
     * </p>
     *
     * @param ticketId  identifier of the ticket
     * @param commentId identifier of the comment
     * @param file      uploaded multipart file
     * @return the newly created attachment metadata
     * @throws IOException               if the uploaded file cannot be read
     * @throws ResourceNotFoundException if the ticket or comment is not found
     * @throws AccessDeniedException     if the user may not attach to the comment
     * @throws InvalidOperationException if the file is invalid
     */
    public TicketCommentAttachmentResponse uploadAttachment(
            Long ticketId, Long commentId, MultipartFile file) throws IOException {

        UserModel currentUser = getAuthenticatedUser();
        TicketCommentModel comment = getAccessibleComment(
                ticketId, commentId, currentUser);

        // A file must belong to a comment written by the current user.
        if (!comment.getUser().getIdUser().equals(currentUser.getIdUser())) {
            throw new AccessDeniedException(
                    "You can only attach files to your own comments");
        }

        validateFile(file);
        String fileName = getSafeFileName(file);
        String contentType = detectContentType(file);

        String mongoFileId = mongoFileStorageService.saveFile(
                GridFsBucketType.TICKET_COMMENT_FILES, file, fileName, contentType);

        try {
            TicketCommentAttachmentModel attachment = new TicketCommentAttachmentModel();
            attachment.setTicketComment(comment);
            attachment.setUploadedBy(currentUser);
            attachment.setFileName(fileName);
            attachment.setContentType(contentType);
            attachment.setFileSize(file.getSize());
            attachment.setMongoFileId(mongoFileId);
            attachment.setCreatedAt(LocalDateTime.now());

            // Flush now so SQL persistence errors can trigger cleanup.
            TicketCommentAttachmentModel savedAttachment = attachmentRepository.saveAndFlush(attachment);

            return convertToResponse(savedAttachment);

        } catch (RuntimeException ex) {
            try {
                mongoFileStorageService.deleteFile(
                        GridFsBucketType.TICKET_COMMENT_FILES, mongoFileId);
            } catch (RuntimeException cleanupException) {
                ex.addSuppressed(cleanupException);
            }
            throw ex;
        }
    }

    /**
     * Retrieves file content for download or inline preview.
     *
     * <p>
     * Before reading from MongoDB, the service verifies that the user can
     * access the comment and that the attachment belongs to that comment.
     * </p>
     *
     * @param ticketId     identifier of the ticket
     * @param commentId    identifier of the comment
     * @param attachmentId identifier of the attachment
     * @return GridFS resource containing the file
     * @throws ResourceNotFoundException if a requested record or file is absent,
     *                                   or any provided identifiers do not match
     * @throws AccessDeniedException     if the user cannot access the comment
     */
    @Transactional(readOnly = true)
    public GridFsResource getAttachmentFile(
            Long ticketId, Long commentId, Long attachmentId) {

        UserModel currentUser = getAuthenticatedUser();
        getAccessibleComment(ticketId, commentId, currentUser);

        TicketCommentAttachmentModel attachment = attachmentRepository
                .findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment with id " + attachmentId + " not found"));

        if (!attachment.getTicketComment().getIdComment().equals(commentId)) {
            throw new ResourceNotFoundException(
                    "Attachment not found in comment " + commentId);
        }

        return mongoFileStorageService.getFile(
                GridFsBucketType.TICKET_COMMENT_FILES, attachment.getMongoFileId());
    }

    /**
     * Loads a comment after validating its ticket relation and visibility.
     *
     * <p>
     * Authorization follows the existing ticket-comments functionality:
     * ADMIN and TECHNICIAN can access ticket comments; USER can access comments
     * only on tickets they created or were requested for, excluding internal
     * comments. Internal comments are hidden from USER even through direct
     * attachment URLs.
     * </p>
     *
     * @param ticketId    expected ticket identifier
     * @param commentId   expected comment identifier
     * @param currentUser authenticated user
     * @return accessible ticket comment
     */
    private TicketCommentModel getAccessibleComment(
            Long ticketId, Long commentId, UserModel currentUser) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        validateTicketCommentAccess(ticket, currentUser);

        TicketCommentModel comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment with id " + commentId + " not found"));

        if (!comment.getTicket().getIdTicket().equals(ticketId)) {
            throw new ResourceNotFoundException(
                    "Comment not found in ticket " + ticketId);
        }

        if (RoleName.USER.name().equalsIgnoreCase(currentUser.getRole().getName())
                && comment.isInternal()) {
            // Do not disclose the existence of internal comments to regular users.
            throw new ResourceNotFoundException(
                    "Comment not found in ticket " + ticketId);
        }

        return comment;
    }

    /**
     * Enforces the same ticket access rules as TicketCommentService.
     *
     * @throws AccessDeniedException if the user cannot view comments
     */
    private void validateTicketCommentAccess(
            TicketModel ticket, UserModel user) {

        String role = user.getRole().getName();
        Long userId = user.getIdUser();

        if (RoleName.ADMIN.name().equalsIgnoreCase(role)
                || RoleName.TECHNICIAN.name().equalsIgnoreCase(role)) {
            return;
        }

        if (RoleName.USER.name().equalsIgnoreCase(role)
                && (ticket.getCreatedBy().getIdUser().equals(userId)
                        || ticket.getRequestedFor().getIdUser().equals(userId))) {
            return;
        }

        throw new AccessDeniedException(
                "You do not have permission to access comments on this ticket");
    }

    /**
     * Resolves the current JWT-authenticated user from MySQL.
     *
     * @return authenticated user entity
     */
    private UserModel getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder
                .getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new AccessDeniedException("Authentication required");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    /**
     * Validates that an uploaded file exists and fits the 10 MiB limit.
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidOperationException(
                    "File size cannot exceed 10 MiB");
        }
    }

    /**
     * Removes supplied path components and validates the resulting filename.
     *
     * @return safe filename for use as attachment metadata
     */
    private String getSafeFileName(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new InvalidOperationException("Invalid file name");
        }

        String normalizedName = originalName.replace('\\', '/');
        String fileName = normalizedName.substring(
                normalizedName.lastIndexOf('/') + 1);

        if (fileName.isBlank() || fileName.length() > 255
                || fileName.chars().anyMatch(Character::isISOControl)) {
            throw new InvalidOperationException("Invalid file name");
        }

        return fileName;
    }

    /**
     * Identifies PDF, PNG and JPEG content using file signature bytes.
     *
     * <p>
     * This basic format verification does not guarantee that the entire
     * file is valid or free of malicious content.
     * </p>
     *
     * @return detected content type
     * @throws IOException if the file cannot be read
     */
    private String detectContentType(MultipartFile file) throws IOException {
        byte[] signature;

        try (var input = file.getInputStream()) {
            signature = input.readNBytes(8);
        }

        // PDF: %PDF-
        if (signature.length >= 5
                && signature[0] == '%'
                && signature[1] == 'P'
                && signature[2] == 'D'
                && signature[3] == 'F'
                && signature[4] == '-') {
            return "application/pdf";
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (signature.length >= 8
                && (signature[0] & 0xFF) == 0x89
                && signature[1] == 'P'
                && signature[2] == 'N'
                && signature[3] == 'G'
                && (signature[4] & 0xFF) == 0x0D
                && (signature[5] & 0xFF) == 0x0A
                && (signature[6] & 0xFF) == 0x1A
                && (signature[7] & 0xFF) == 0x0A) {
            return "image/png";
        }

        // JPEG: FF D8 FF
        if (signature.length >= 3
                && (signature[0] & 0xFF) == 0xFF
                && (signature[1] & 0xFF) == 0xD8
                && (signature[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        throw new InvalidOperationException(
                "Only PDF, PNG and JPEG files are allowed");
    }

    /**
     * Maps an attachment entity to its public response DTO.
     *
     * <p>
     * The internal MongoDB identifier is deliberately excluded.
     * </p>
     *
     * @param attachment stored attachment metadata
     * @return response DTO
     */
    private TicketCommentAttachmentResponse convertToResponse(
            TicketCommentAttachmentModel attachment) {

        UserModel uploader = attachment.getUploadedBy();
        UserSummaryResponse uploaderResponse = new UserSummaryResponse(
                uploader.getIdUser(), uploader.getUsername());

        return new TicketCommentAttachmentResponse(
                attachment.getIdAttachment(),
                attachment.getTicketComment().getIdComment(),
                uploaderResponse,
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getCreatedAt());
    }
}
