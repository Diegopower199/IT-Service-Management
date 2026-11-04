# Help Desk — Database

This directory contains the MySQL initialization scripts for the Help Desk / IT Service Management application.

The database schema is managed manually through SQL scripts. Hibernate validates the existing schema without creating or modifying tables.

## Requirements

- MySQL 8.0+
- MySQL Workbench or another SQL client

## Database Setup

Execute the following scripts **in order**:

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `00_create_database.sql` | Creates the MySQL database                        |
| `01_create_tables.sql`   | Creates the tables, relationships and constraints |
| `02_seed_data.sql`       | Inserts sample data for testing                   |

The scripts are intended for a new, empty database. Do not execute them against an existing database containing important data.

## Demo Accounts

The seed script creates three main accounts for testing the different application roles.

| Username     | Role       |
| ------------ | ---------- |
| `admin`      | ADMIN      |
| `technician` | TECHNICIAN |
| `user`       | USER       |

Additional users, tickets, comments and history records are also included to demonstrate the application's functionality.

All demo accounts use the same BCrypt password hash defined in `02_seed_data.sql`.

**Note:** Demo accounts are intended for local development and testing only.

## Spring Boot Configuration

In `back-end/src/main/resources/application.properties`, configure:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

With this configuration, Hibernate validates the database schema but does not automatically create or modify tables.

## Verify the Setup

After executing the scripts, run:

```sql
USE helpdesk;

SHOW TABLES;

SELECT
    u.username,
    r.name AS role
FROM users u
JOIN roles r ON u.id_role = r.id_role;

SELECT COUNT(*) AS total_tickets
FROM tickets;
```

Finally, start the Spring Boot application and verify that it connects to MySQL successfully.