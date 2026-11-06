
package com.example.back_end.service;

import java.io.IOException;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.gridfs.model.GridFSFile;

import com.example.back_end.enums.GridFsBucketType;
import com.example.back_end.exception.ResourceNotFoundException;

/**
 * Provides common GridFS storage operations for ticket attachments,
 * comment attachments and user avatars.
 *
 * File authorization and MySQL metadata are handled by the
 * corresponding business services.
 */
@Service
public class MongoFileStorageService {

    private final GridFsTemplate ticketGridFsTemplate;
    private final GridFsTemplate ticketCommentGridFsTemplate;
    private final GridFsTemplate userAvatarGridFsTemplate;

    public MongoFileStorageService(
            @Qualifier("ticketGridFsTemplate") GridFsTemplate ticketGridFsTemplate,

            @Qualifier("ticketCommentGridFsTemplate") GridFsTemplate ticketCommentGridFsTemplate,

            @Qualifier("userAvatarGridFsTemplate") GridFsTemplate userAvatarGridFsTemplate) {

        this.ticketGridFsTemplate = ticketGridFsTemplate;
        this.ticketCommentGridFsTemplate = ticketCommentGridFsTemplate;
        this.userAvatarGridFsTemplate = userAvatarGridFsTemplate;
    }

    /**
     * Returns the GridFS template associated with the specified bucket.
     *
     * @param bucket type of GridFS bucket
     * @return template configured for the selected bucket
     */
    private GridFsTemplate getTemplate(GridFsBucketType bucket) {
        return switch (bucket) {
            case TICKET_FILES -> ticketGridFsTemplate;
            case TICKET_COMMENT_FILES -> ticketCommentGridFsTemplate;
            case USER_AVATARS -> userAvatarGridFsTemplate;
        };
    }

    /**
     * Stores a file in the selected GridFS bucket.
     *
     * @return hexadecimal MongoDB ObjectId
     */
    public String saveFile(
            GridFsBucketType bucket,
            MultipartFile file,
            String fileName,
            String contentType) throws IOException {

        GridFsTemplate template = getTemplate(bucket);

        try (var inputStream = file.getInputStream()) {

            ObjectId mongoFileId = template.store(
                    inputStream,
                    fileName,
                    contentType);

            return mongoFileId.toHexString();
        }
    }

    /**
     * Retrieves a file from the selected bucket.
     *
     * Older ticket attachments can still be read from
     * the legacy GridFS bucket.
     */
    public GridFsResource getFile(
            GridFsBucketType bucket,
            String mongoFileId) {

        GridFsTemplate template = getTemplate(bucket);

        Query query = new Query(
                Criteria.where("_id")
                        .is(new ObjectId(mongoFileId)));

        GridFSFile file = template.findOne(query);

        if (file != null) {
            return template.getResource(file);
        }

        throw new ResourceNotFoundException(
                "File not found in MongoDB");
    }

    /**
     * Removes a file from the selected bucket.
     *
     * Used only for internal cleanup or file replacement.
     */
    public void deleteFile(
            GridFsBucketType bucket,
            String mongoFileId) {

        GridFsTemplate template = getTemplate(bucket);

        Query query = new Query(
                Criteria.where("_id")
                        .is(new ObjectId(mongoFileId)));

        template.delete(query);
    }
}
