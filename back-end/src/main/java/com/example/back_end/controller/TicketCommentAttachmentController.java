package com.example.back_end.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.back_end.dtos.ticketCommentAttachment.TicketCommentAttachmentResponse;
import com.example.back_end.service.TicketCommentAttachmentService;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing files attached to ticket comments.
 *
 * <p>
 * Provides endpoints to upload, list, download and preview
 * comment attachments.
 * </p>
 *
 * <p>
 * Business rules, authorization and comment visibility
 * are delegated to {@link TicketCommentAttachmentService}.
 * </p>
 *
 * <p>
 * No user-facing attachment deletion endpoint is provided.
 * </p>
 */
@RestController
@RequestMapping("/tickets/{ticketId}/comments/{commentId}/attachments")
@RequiredArgsConstructor
public class TicketCommentAttachmentController {

    private final TicketCommentAttachmentService commentAttachmentService;

    /**
     * Uploads a file to an existing ticket comment.
     *
     * <p>
     * The request must use multipart/form-data and provide
     * the file in a field named {@code file}.
     * </p>
     *
     * @param ticketId  identifier of the ticket
     * @param commentId identifier of the comment
     * @param file      file to upload
     * @return HTTP 201 with the new attachment metadata
     * @throws IOException if the uploaded file cannot be read
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketCommentAttachmentResponse> uploadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestParam("file") MultipartFile file) throws IOException {

        TicketCommentAttachmentResponse attachment = commentAttachmentService.uploadAttachment(
                ticketId,
                commentId,
                file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(attachment);
    }

    /**
     * Retrieves metadata of all attachments belonging to a comment.
     *
     * <p>
     * File contents are not retrieved from MongoDB
     * during this operation.
     * </p>
     *
     * @param ticketId  identifier of the ticket
     * @param commentId identifier of the comment
     * @return HTTP 200 with the attachment metadata list
     */
    @GetMapping
    public ResponseEntity<List<TicketCommentAttachmentResponse>> getAttachmentsByCommentId(
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {

        List<TicketCommentAttachmentResponse> attachments = commentAttachmentService.getAttachmentsByCommentId(
                ticketId,
                commentId);

        return ResponseEntity.ok(attachments);
    }

    /**
     * Downloads a file attached to a ticket comment.
     *
     * <p>
     * Uses Content-Disposition: attachment to request
     * a file download from the client.
     * </p>
     *
     * @param ticketId     identifier of the ticket
     * @param commentId    identifier of the comment
     * @param attachmentId identifier of the attachment
     * @return HTTP 200 with the requested file
     * @throws IOException if the resource size cannot be read
     */
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @PathVariable Long attachmentId) throws IOException {

        GridFsResource file = commentAttachmentService.getAttachmentFile(
                ticketId,
                commentId,
                attachmentId);

        ContentDisposition disposition = ContentDisposition
                .attachment()
                .filename(file.getFilename(), StandardCharsets.UTF_8)
                .build();

        return buildFileResponse(file, disposition);
    }

    /**
     * Previews a file attached to a ticket comment.
     *
     * <p>
     * Uses Content-Disposition: inline so supported
     * clients can display PDF, PNG or JPEG content.
     * </p>
     *
     * @param ticketId     identifier of the ticket
     * @param commentId    identifier of the comment
     * @param attachmentId identifier of the attachment
     * @return HTTP 200 with the requested file
     * @throws IOException if the resource size cannot be read
     */
    @GetMapping("/{attachmentId}/preview")
    public ResponseEntity<Resource> previewAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @PathVariable Long attachmentId) throws IOException {

        GridFsResource file = commentAttachmentService.getAttachmentFile(
                ticketId,
                commentId,
                attachmentId);

        ContentDisposition disposition = ContentDisposition
                .inline()
                .filename(file.getFilename(), StandardCharsets.UTF_8)
                .build();

        return buildFileResponse(file, disposition);
    }

    /**
     * Builds a common HTTP response for file downloads and previews.
     *
     * <p>
     * The Content-Disposition parameter determines whether
     * the client should download or display the file inline.
     * </p>
     *
     * <p>
     * Cache-Control and X-Content-Type-Options headers
     * reduce unintended caching and MIME-type sniffing.
     * </p>
     *
     * @param file        GridFS resource retrieved by the service
     * @param disposition HTTP content disposition
     * @return HTTP response containing the file resource
     * @throws IOException if the file size cannot be determined
     */
    private ResponseEntity<Resource> buildFileResponse(
            GridFsResource file,
            ContentDisposition disposition) throws IOException {

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .contentLength(file.contentLength())
                .headers(headers -> headers.setContentDisposition(disposition))
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(file);
    }
}
