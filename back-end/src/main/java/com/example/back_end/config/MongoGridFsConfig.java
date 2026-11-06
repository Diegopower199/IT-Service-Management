package com.example.back_end.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

/**
 * Configures the GridFS buckets used for file storage.
 *
 * All buckets share the same MongoDB database connection.
 */
@Configuration
public class MongoGridFsConfig {

    @Bean("ticketGridFsTemplate")
    public GridFsTemplate ticketGridFsTemplate(
            MongoDatabaseFactory databaseFactory,
            MongoConverter converter) {

        return new GridFsTemplate(
                databaseFactory, converter, "ticket_files");
    }

    @Bean("commentGridFsTemplate")
    public GridFsTemplate commentGridFsTemplate(
            MongoDatabaseFactory databaseFactory,
            MongoConverter converter) {

        return new GridFsTemplate(
                databaseFactory, converter, "comment_files");
    }

    @Bean("avatarGridFsTemplate")
    public GridFsTemplate avatarGridFsTemplate(
            MongoDatabaseFactory databaseFactory,
            MongoConverter converter) {

        return new GridFsTemplate(
                databaseFactory, converter, "avatars");
    }
}
