
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

import com.example.back_end.dtos.ticketAttachment.TicketAttachmentResponse;
import com.example.back_end.dtos.user.UserSummaryResponse;
import com.example.back_end.enums.RoleName;
import com.example.back_end.exception.InvalidOperationException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.TicketAttachmentModel;
import com.example.back_end.model.TicketModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.TicketAttachmentRepository;
import com.example.back_end.repository.TicketRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Manages ticket attachments and their associated business rules.
 *
 * Coordinates two different storage systems:
 * - MongoDB GridFS stores the actual file content.
 * - MySQL stores attachment metadata and relationships.
 *
 * Provides operations to upload, list and retrieve attachments,
 * including file validation and ticket-level authorization.
 *
 * File removal is not exposed to users. MongoDB deletion is used
 * internally to compensate for metadata persistence failures.
 *
 * Note that MongoDB and MySQL do not share a single transaction.
 */
@Service
@RequiredArgsConstructor
public class TicketAttachmentService {

    // Maximum allowed file size: 10 MiB.
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MongoFileStorageService mongoFileStorageService;

    /**
     * Retrieves all attachments associated with a specific ticket.
     *
     * Verifies that the ticket exists and that the authenticated user
     * is authorized to access it.
     *
     * Only attachment metadata is retrieved from MySQL.
     * The actual file content remains in MongoDB.
     *
     * Results are ordered by creation date, newest first.
     *
     * @param ticketId identifier of the ticket
     * @return list of attachment response DTOs
     * @throws ResourceNotFoundException if the ticket does not exist
     * @throws AccessDeniedException     if the user cannot access the ticket
     */
    @Transactional(readOnly = true)
    public List<TicketAttachmentResponse> getAttachmentsByTicketId(
            Long ticketId) {

        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        UserModel currentUser = getAuthenticatedUser();

        validateTicketAccess(ticket, currentUser);

        // Convert MySQL entities into DTOs without retrieving file content.
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * Uploads a new attachment to an existing ticket.
     *
     * Validates ticket access, file size, filename and content type.
     *
     * The file is first stored in MongoDB GridFS. Its metadata,
     * including the MongoDB file identifier, is then saved in MySQL.
     *
     * If metadata persistence fails, a compensating deletion
     * is attempted to prevent orphaned files in MongoDB.
     *
     * @param ticketId identifier of the destination ticket
     * @param file     file received through a multipart request
     * @return metadata of the newly created attachment
     * @throws IOException               if the uploaded file cannot be read
     * @throws ResourceNotFoundException if the ticket does not exist
     * @throws AccessDeniedException     if the user cannot access the ticket
     * @throws InvalidOperationException if file validation fails
     */
    public TicketAttachmentResponse uploadAttachment(
            Long ticketId,
            MultipartFile file) throws IOException {

        // 1. Verify that the destination ticket exists.
        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        // 2. Identify the authenticated user and verify ticket access.
        UserModel currentUser = getAuthenticatedUser();

        validateTicketAccess(ticket, currentUser);

        // 3. Validate the file before performing any storage operation.
        validateFile(file);

        String fileName = getSafeFileName(file);
        String contentType = detectContentType(file);

        // 4. Store the file content in MongoDB and obtain its identifier.
        String mongoFileId = mongoFileStorageService.saveFile(
                file,
                fileName,
                contentType);

        // 5. Persist attachment metadata in MySQL.
        try {
            TicketAttachmentModel attachment = new TicketAttachmentModel();

            attachment.setTicket(ticket);
            attachment.setUploadedBy(currentUser);
            attachment.setFileName(fileName);
            attachment.setContentType(contentType);
            attachment.setFileSize(file.getSize());
            attachment.setMongoFileId(mongoFileId);
            attachment.setCreatedAt(LocalDateTime.now());

            // Flush pending SQL changes and save the attachment metadata.
            TicketAttachmentModel savedAttachment = attachmentRepository.saveAndFlush(attachment);

            return convertToResponse(savedAttachment);

        } catch (RuntimeException ex) {

            // If MySQL persistence fails after MongoDB storage, *attempt to remove the
            // previously uploaded file.
            try {
                mongoFileStorageService.deleteFile(mongoFileId);
            } catch (RuntimeException cleanupException) {

                // Preserve the original error and attach the cleanup failure.
                ex.addSuppressed(cleanupException);
            }

            throw ex;
        }
    }

    /**
     * Retrieves the content of a specific ticket attachment.
     *
     * Checks ticket access and verifies that the requested attachment
     * belongs to the specified ticket.
     *
     * The MongoDB identifier is obtained from MySQL and used
     * to locate the corresponding file in GridFS.
     *
     * This method is shared by download and preview operations.
     *
     * @param ticketId     identifier of the ticket
     * @param attachmentId identifier of the attachment
     * @return GridFS resource providing access to the stored file
     * @throws ResourceNotFoundException if the ticket or attachment
     *                                   does not exist, or the attachment belongs
     *                                   to another ticket
     * @throws AccessDeniedException     if the user cannot access the ticket
     */
    @Transactional(readOnly = true)
    public GridFsResource getAttachmentFile(
            Long ticketId,
            Long attachmentId) {

        // 1. Verify that the requested ticket exists.
        TicketModel ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ticket with id " + ticketId + " not found"));

        // 2. Verify the authenticated user's permissions.
        UserModel currentUser = getAuthenticatedUser();

        validateTicketAccess(ticket, currentUser);

        // 3. Retrieve attachment metadata from MySQL.
        TicketAttachmentModel attachment = attachmentRepository
                .findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attachment with id " + attachmentId + " not found"));

        /*
         * 4. Prevent accessing an attachment through an unrelated ticket.
         * Both identifiers must correspond to the same relationship.
         */
        if (!attachment.getTicket().getIdTicket().equals(ticketId)) {
            throw new ResourceNotFoundException(
                    "Attachment not found in ticket " + ticketId);
        }

        // 5. Retrieve the actual file from MongoDB GridFS.
        return mongoFileStorageService.getFile(
                attachment.getMongoFileId());
    }

    /**
     * Retrieves the currently authenticated user from MySQL.
     *
     * Uses Spring Security's context to obtain the username
     * established during JWT authentication.
     *
     * The user is then loaded from MySQL to access its role
     * and identifier for authorization and ownership tracking.
     *
     * @return authenticated user entity
     * @throws AccessDeniedException     if no valid authentication is available
     * @throws ResourceNotFoundException if the user is not found in MySQL
     */
    private UserModel getAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }

        // The JWT authentication process provides the username.
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    /**
     * Validates whether a user can access attachments of a ticket.
     *
     * Current authorization rules:
     * - ADMIN: can access attachments of any ticket.
     * - TECHNICIAN: can access attachments of assigned tickets.
     * - USER: can access tickets they created or requested for.
     *
     * A successful validation returns normally.
     * Unauthorized access results in an exception.
     *
     * @param ticket ticket being accessed
     * @param user   authenticated user
     * @throws AccessDeniedException if the user is not authorized
     */
    private void validateTicketAccess(
            TicketModel ticket,
            UserModel user) {

        String role = user.getRole().getName();
        Long userId = user.getIdUser();

        // Administrators have unrestricted ticket access.
        if (RoleName.ADMIN.name().equalsIgnoreCase(role)) {
            return;
        }

        // Technicians can access attachments of their assigned tickets.
        if (RoleName.TECHNICIAN.name().equalsIgnoreCase(role)) {
            if (ticket.getAssignedTo() != null
                    && ticket.getAssignedTo().getIdUser().equals(userId)) {
                return;
            }
        }

        // Regular users can access tickets they created or requested for.
        if (RoleName.USER.name().equalsIgnoreCase(role)) {
            if (ticket.getCreatedBy().getIdUser().equals(userId)
                    || ticket.getRequestedFor().getIdUser().equals(userId)) {
                return;
            }
        }

        throw new AccessDeniedException(
                "You do not have permission to upload attachments to this ticket");
    }

    /**
     * Validates the presence and maximum size of an uploaded file.
     *
     * These checks complement the multipart upload limits
     * configured in application.properties.
     *
     * @param file file to validate
     * @throws InvalidOperationException if the file is empty,
     *                                   missing or exceeds the maximum allowed size
     */
    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidOperationException(
                    "File size cannot exceed 10 MB");
        }
    }

    /**
     * Extracts the filename from the multipart upload.
     *
     * Removes any directory path supplied by the client,
     * validates the resulting name and rejects control characters.
     *
     * This provides basic filename normalization, not complete
     * sanitization for every possible filesystem.
     *
     * @param file uploaded multipart file
     * @return normalized filename without directory components
     * @throws InvalidOperationException if the filename is invalid
     */
    private String getSafeFileName(MultipartFile file) {

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new InvalidOperationException("Invalid file name");
        }

        // Normalize Windows and Unix path separators.
        String normalizedName = originalName.replace('\\', '/');

        // Extract only the final filename component.
        String fileName = normalizedName.substring(
                normalizedName.lastIndexOf('/') + 1);

        if (fileName.isBlank()
                || fileName.length() > 255
                || fileName.chars().anyMatch(Character::isISOControl)) {
            throw new InvalidOperationException("Invalid file name");
        }

        return fileName;
    }

    /**
     * Identifies the file's MIME type using its initial byte signature.
     *
     * Reads up to eight bytes and checks known signatures for:
     * - PDF: %PDF-
     * - PNG: 89 50 4E 47 0D 0A 1A 0A
     * - JPEG: FF D8 FF
     *
     * This avoids trusting the MIME type declared by the client.
     * Signature matching is a basic format check and does not
     * guarantee that the entire file is valid or safe.
     *
     * @param file uploaded file
     * @return detected MIME type
     * @throws IOException               if the file content cannot be read
     * @throws InvalidOperationException if the signature is unsupported
     */
    private String detectContentType(MultipartFile file) throws IOException {

        byte[] signature;

        // Read only the bytes needed to identify supported formats.
        try (var input = file.getInputStream()) {
            signature = input.readNBytes(8);
        }

        // PDF signature: %PDF-
        if (signature.length >= 5
                && signature[0] == '%'
                && signature[1] == 'P'
                && signature[2] == 'D'
                && signature[3] == 'F'
                && signature[4] == '-') {
            return "application/pdf";
        }

        // PNG signature: 89 50 4E 47 0D 0A 1A 0A
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

        // JPEG signature: FF D8 FF
        // The 0xFF mask treats signed Java bytes as unsigned values.
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
     * Converts a JPA attachment entity into its API response DTO.
     *
     * Includes the attachment's metadata and a summary of
     * the uploading user.
     *
     * The internal MongoDB file identifier is intentionally
     * excluded from the response.
     *
     * @param attachment attachment entity retrieved from MySQL
     * @return DTO containing the attachment's public information
     */
    private TicketAttachmentResponse convertToResponse(
            TicketAttachmentModel attachment) {

        UserModel user = attachment.getUploadedBy();

        UserSummaryResponse userResponse = new UserSummaryResponse(
                user.getIdUser(),
                user.getUsername());

        return new TicketAttachmentResponse(
                attachment.getIdAttachment(),
                attachment.getTicket().getIdTicket(),
                userResponse,
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getFileSize(),
                attachment.getCreatedAt());
    }
}
