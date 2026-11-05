
USE helpdesk;

CREATE TABLE ticket_attachments (
    id_attachment BIGINT NOT NULL AUTO_INCREMENT,
    id_ticket BIGINT NOT NULL,
    id_uploaded_by BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mongo_file_id VARCHAR(24) NOT NULL,
    created_at DATETIME (6) NOT NULL,
    PRIMARY KEY (id_attachment),
    INDEX idx_attachments_ticket (id_ticket),
    INDEX idx_attachments_uploaded_by (id_uploaded_by),
    UNIQUE KEY uq_attachments_mongo_file (mongo_file_id),
    CONSTRAINT fk_attachments_ticket FOREIGN KEY (id_ticket)
        REFERENCES tickets (id_ticket),
    CONSTRAINT fk_attachments_user FOREIGN KEY (id_uploaded_by)
        REFERENCES users (id_user)
)
ENGINE = InnoDB;
