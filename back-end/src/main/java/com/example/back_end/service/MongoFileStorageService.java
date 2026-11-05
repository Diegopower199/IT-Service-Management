
package com.example.back_end.service;

import java.io.IOException;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.web.multipart.MultipartFile;

import com.example.back_end.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Manages file storage in MongoDB using GridFS.
 *
 * Provides operations to store, retrieve and remove files.
 * This service does not handle ticket permissions or MySQL metadata.
 *
 * File deletion is only used internally to clean up MongoDB
 * when an attachment cannot be registered in MySQL.
 */
@Service
@RequiredArgsConstructor
public class MongoFileStorageService {

    private final GridFsTemplate gridFsTemplate;

    /**
     * Stores a file in MongoDB using GridFS.
     *
     * @param file        the uploaded file
     * @param fileName    the filename to store
     * @param contentType the validated MIME type
     * @return the MongoDB file ID as a hexadecimal String
     * @throws IOException if the file content cannot be read
     */
    public String saveFile(
            MultipartFile file,
            String fileName,
            String contentType) throws IOException {

        ObjectId mongoFileId;

        // Store the file content and close the input stream automatically.
        try (var inputStream = file.getInputStream()) {
            mongoFileId = gridFsTemplate.store(
                    inputStream,
                    fileName,
                    contentType);
        }

        // Convert ObjectId to String for storage in MySQL.
        return mongoFileId.toHexString();
    }

    /**
     * Retrieves a stored file from MongoDB using its identifier.
     *
     * @param mongoFileId the MongoDB file identifier
     * @return the GridFS resource containing access to the file
     * @throws ResourceNotFoundException if the file does not exist
     */
    public GridFsResource getFile(String mongoFileId) {

        Query query = new Query(
                Criteria.where("_id")
                        .is(new ObjectId(mongoFileId)));

        GridFSFile gridFsFile = gridFsTemplate.findOne(query);

        if (gridFsFile == null) {
            throw new ResourceNotFoundException(
                    "File not found in MongoDB");
        }

        return gridFsTemplate.getResource(gridFsFile);
    }

    /**
     * Removes a file from MongoDB using its identifier.
     *
     * Used only as a cleanup operation when saving the
     * attachment metadata in MySQL fails.
     *
     * @param mongoFileId the MongoDB file identifier
     */
    public void deleteFile(String mongoFileId) {

        Query query = new Query(
                Criteria.where("_id")
                        .is(new ObjectId(mongoFileId)));

        gridFsTemplate.delete(query);
    }
}
