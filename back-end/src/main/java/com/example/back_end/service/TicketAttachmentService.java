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
import com.example.back_end.enums.GridFsBucketType;
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
 * Provides the business operations for attachments belonging directly to a
 * ticket.
 *
 * <p>
 * Attachment metadata (ticket, uploader, filename, MIME type, size and MongoDB
 * identifier) is stored in MySQL. The binary file content is stored in the
 * {@link GridFsBucketType#TICKET TICKET} GridFS bucket in MongoDB.
 * </p>
 *
 * <p>
 * All operations enforce ticket-level authorization. File uploads additionally
 * validate the file size, filename and binary signature. Listing an attachment
 * never loads its binary content from MongoDB.
 * </p>
 *
 * <p>
 * MySQL and MongoDB do not share a transaction. If storing attachment metadata
 * fails after the file has been uploaded, this service attempts to delete the
 * newly stored MongoDB file as a compensating action. This cleanup is
 * best-effort
 * and is not an atomic distributed rollback.
 * </p>
 *
 * <p>
 * No user-facing attachment deletion operation is provided.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class TicketAttachmentService {

    /** Maximum accepted upload size, in bytes (10 MiB). */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final MongoFileStorageService mongoFileStorageService;

    /**
     * Returns the metadata of all attachments belonging to the requested ticket.
     *
     * <p>
     * The ticket must exist and the authenticated user must be allowed to access
     * its attachments. The repository returns records in descending creation-date
     * order. This method does not read any binary content from GridFS.
     * </p>
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
     * Validates and uploads a new file attached directly to a ticket.
     *
     * <p>
     * The operation checks ticket authorization and validates the uploaded
     * file before writing anything. The binary content is saved to the
     * {@link GridFsBucketType#TICKET TICKET} GridFS bucket, and the returned
     * MongoDB identifier is persisted with the attachment metadata in MySQL.
     * </p>
     *
     * <p>
     * If saving the metadata throws a runtime exception, a compensating
     * MongoDB deletion is attempted. Any cleanup failure is attached to the
     * original exception as a suppressed exception. There is no atomic
     * transaction spanning MySQL and MongoDB.
     * </p>
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
                GridFsBucketType.TICKET_FILES,
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

            // Execute the INSERT before returning, so persistence errors can
            // trigger the compensating MongoDB cleanup.
            TicketAttachmentModel savedAttachment = attachmentRepository.saveAndFlush(attachment);

            return convertToResponse(savedAttachment);

        } catch (RuntimeException ex) {

            // Compensate for a failed metadata write by removing the new file.
            try {
                mongoFileStorageService.deleteFile(
                        GridFsBucketType.TICKET_FILES,
                        mongoFileId);
            } catch (RuntimeException cleanupException) {

                // Preserve the original error and attach the cleanup failure.
                ex.addSuppressed(cleanupException);
            }

            throw ex;
        }
    }

    /**
     * Resolves the stored file content of a specific ticket attachment.
     *
     * <p>
     * Authorization is checked against the ticket before the attachment
     * metadata is loaded. The attachment must belong to the specified ticket,
     * preventing a caller from retrieving a file through an unrelated ticket.
     * </p>
     *
     * <p>
     * The file is retrieved from the {@code TICKET} bucket; the shared MongoDB
     * storage service also supports a temporary fallback to the legacy {@code fs}
     * bucket for files uploaded before bucket separation. Both preview and download
     * endpoints reuse this operation.
     * </p>
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
                GridFsBucketType.TICKET_FILES,
                attachment.getMongoFileId());
    }

    /**
     * Loads the authenticated user using the username provided by Spring Security.
     *
     * <p>
     * The user entity is retrieved from MySQL because ticket authorization and
     * attachment ownership require the current user's persisted role and ID.
     * </p>
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
     * Enforces the access rules for ticket-level attachments.
     *
     * <ul>
     * <li>{@code ADMIN}: may access attachments of any ticket.</li>
     * <li>{@code TECHNICIAN}: may access attachments of tickets assigned to
     * them.</li>
     * <li>{@code USER}: may access attachments of tickets they created or for
     * which they are the requested user.</li>
     * </ul>
     *
     * <p>
     * Returns normally when access is granted; otherwise throws an exception.
     * This policy applies to listing, uploading, previewing and downloading.
     * </p>
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
                "You do not have permission to access attachments of this ticket");
    }

    /**
     * Rejects missing, empty or oversized uploads before storing them.
     *
     * <p>
     * These application-level checks complement the HTTP multipart limits
     * configured in {@code application.properties}.
     * </p>
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
                    "File size cannot exceed 10 MiB");
        }
    }

    /**
     * Extracts and performs basic validation of the original filename.
     *
     * <p>
     * Normalizes Windows and Unix path separators, discards directory
     * components, limits the filename to 255 characters and rejects ISO control
     * characters. This is basic normalization, not a general-purpose filesystem
     * sanitization routine.
     * </p>
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
     * Determines the MIME type from the initial bytes of the uploaded file.
     *
     * <p>
     * Reads at most eight bytes and recognizes these signatures:
     * </p>
     * <ul>
     * <li>PDF: {@code %PDF-}</li>
     * <li>PNG: {@code 89 50 4E 47 0D 0A 1A 0A}</li>
     * <li>JPEG: {@code FF D8 FF}</li>
     * </ul>
     *
     * <p>
     * This check does not trust the client-provided MIME type. A matching
     * header does not, by itself, prove that the whole file is valid or safe.
     * </p>
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
     * Maps an attachment entity to the public API response.
     *
     * <p>
     * Includes attachment metadata and a short uploader summary. The internal
     * MongoDB file identifier is deliberately excluded from the response.
     * </p>
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
