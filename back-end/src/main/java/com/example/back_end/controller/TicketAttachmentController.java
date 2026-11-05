
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

import com.example.back_end.dtos.ticketAttachment.TicketAttachmentResponse;
import com.example.back_end.service.TicketAttachmentService;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing ticket attachments.
 *
 * Provides endpoints to upload, list, download and preview files
 * associated with a specific ticket.
 *
 * File storage, validation and authorization are delegated
 * to TicketAttachmentService.
 *
 * Files are stored in MongoDB GridFS, while their metadata
 * and ticket relationships are maintained in MySQL.
 *
 * Attachments cannot be deleted through this API.
 */
@RestController
@RequestMapping("/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

    private final TicketAttachmentService ticketAttachmentService;

    /**
     * Retrieves the metadata of all attachments belonging to a ticket.
     *
     * Only attachment information is returned, without file content.
     *
     * GET /tickets/{ticketId}/attachments
     *
     * @param ticketId identifier of the ticket
     * @return HTTP 200 with the list of attachment DTOs
     */
    @GetMapping
    public ResponseEntity<List<TicketAttachmentResponse>> getAttachmentsByTicketId(
            @PathVariable Long ticketId) {

        List<TicketAttachmentResponse> attachments = ticketAttachmentService.getAttachmentsByTicketId(ticketId);

        return ResponseEntity.ok(attachments);
    }

    /**
     * Uploads a new attachment to an existing ticket.
     *
     * Receives the file as multipart/form-data and delegates
     * validation and storage to TicketAttachmentService.
     *
     * POST /tickets/{ticketId}/attachments
     *
     * @param ticketId identifier of the destination ticket
     * @param file     uploaded file
     * @return HTTP 201 with the created attachment metadata
     * @throws IOException if the uploaded file cannot be read
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketAttachmentResponse> uploadAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) throws IOException {

        TicketAttachmentResponse attachment = ticketAttachmentService.uploadAttachment(ticketId, file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(attachment);
    }

    /**
     * Downloads a specific attachment from a ticket.
     *
     * Uses Content-Disposition: attachment to instruct the
     * client to download the file rather than display it inline.
     *
     * GET /tickets/{ticketId}/attachments/{attachmentId}/download
     *
     * @param ticketId     identifier of the ticket
     * @param attachmentId identifier of the attachment
     * @return HTTP 200 with the file content
     * @throws IOException if the file resource cannot be accessed
     */
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) throws IOException {

        GridFsResource file = ticketAttachmentService
                .getAttachmentFile(ticketId, attachmentId);

        // Force file download using its original filename.
        ContentDisposition disposition = ContentDisposition
                .attachment()
                .filename(file.getFilename(), StandardCharsets.UTF_8)
                .build();

        return buildFileResponse(file, disposition);
    }

    /**
     * Previews a specific attachment in the browser.
     *
     * Uses Content-Disposition: inline to allow compatible
     * file types, such as images and PDFs, to be displayed
     * directly without forcing a download.
     *
     * GET /tickets/{ticketId}/attachments/{attachmentId}/preview
     *
     * @param ticketId     identifier of the ticket
     * @param attachmentId identifier of the attachment
     * @return HTTP 200 with the file content for inline display
     * @throws IOException if the file resource cannot be accessed
     */
    @GetMapping("/{attachmentId}/preview")
    public ResponseEntity<Resource> previewAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) throws IOException {

        GridFsResource file = ticketAttachmentService
                .getAttachmentFile(ticketId, attachmentId);

        // Allow the browser to display the file when supported.
        ContentDisposition disposition = ContentDisposition
                .inline()
                .filename(file.getFilename(), StandardCharsets.UTF_8)
                .build();

        return buildFileResponse(file, disposition);
    }

    /**
     * Builds a standardized HTTP response for file delivery.
     *
     * Shared by download and preview endpoints to avoid
     * duplicating HTTP header configuration.
     *
     * The Content-Disposition parameter determines whether
     * the file is downloaded or displayed inline.
     *
     * Cache-Control: no-store prevents response caching.
     * X-Content-Type-Options: nosniff prevents MIME sniffing.
     *
     * @param file        GridFS resource containing the file
     * @param disposition desired content disposition
     * @return HTTP 200 response containing the file resource
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
