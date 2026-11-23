# Help Desk — Base de datos

[English](./README.md) | **Español**

Help Desk / IT Service Management utiliza **MySQL** para los datos relacionales y los metadatos de archivos, y **MongoDB GridFS** para el contenido binario de los adjuntos y avatares. Este directorio contiene los scripts SQL de inicialización de MySQL.

Spring Boot utiliza `spring.jpa.hibernate.ddl-auto=validate`. Inicializa el esquema relacional antes de arrancar el backend. Hibernate valida el esquema existente sin crear ni modificar tablas.

## Modelo de datos

La base de datos MySQL se llama `helpdesk`. [01_create_tables.sql](./01_create_tables.sql) define 13 tablas InnoDB.

| Área                     | Tabla                        | Finalidad                                                                                                                                                                                                                |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Configuración            | `roles`                      | Roles de la aplicación que se asignan a las cuentas de usuario.                                                                                                                                                          |
| Configuración            | `departments`                | Departamentos a los que pertenecen los usuarios.                                                                                                                                                                         |
| Configuración            | `categories`                 | Clasificaciones de los tickets.                                                                                                                                                                                          |
| Configuración            | `priorities`                 | Niveles de urgencia de los tickets.                                                                                                                                                                                      |
| Configuración            | `statuses`                   | Estados del flujo de trabajo de los tickets.                                                                                                                                                                             |
| Usuarios y autenticación | `users`                      | Identidad de inicio de sesión, perfil, hash BCrypt de la contraseña, indicador de cuenta habilitada, rol y departamento.                                                                                                 |
| Usuarios y autenticación | `refresh_tokens`             | Hashes de los tokens de renovación asociados a un usuario, fechas de creación y caducidad, y estado de revocación. El hash se calcula con SHA-256.                                                                       |
| Gestión de tickets       | `tickets`                    | Detalles, marcas de tiempo, usuario que crea el ticket, usuario que recibe el soporte, técnico asignado, categoría, prioridad y estado.                                                                                  |
| Gestión de tickets       | `ticket_comments`            | Comentarios del ticket con su autor y un indicador `internal`. El valor `0` indica que el comentario es público dentro del ticket y `1` indica que es interno.                                                           |
| Gestión de tickets       | `ticket_history`             | Eventos de creación del ticket, cambios de campos, asignación y reasignación. Cada registro incluye el usuario que realizó la acción, la acción, la marca de tiempo y, cuando corresponde, los valores anterior y nuevo. |
| Metadatos de archivos    | `ticket_attachments`         | Metadatos de los archivos que se adjuntan directamente a los tickets.                                                                                                                                                    |
| Metadatos de archivos    | `ticket_comment_attachments` | Metadatos de los archivos que se adjuntan a los comentarios de tickets.                                                                                                                                                  |
| Metadatos de archivos    | `user_avatars`               | Metadatos del avatar actual, con un máximo de una fila por usuario.                                                                                                                                                      |

### Claves foráneas

| Columna de origen                              | Columna referenciada         | Restricción SQL                         |
| ---------------------------------------------- | ---------------------------- | --------------------------------------- |
| `users.id_role`                                | `roles.id_role`              | `FK_users_roles`                        |
| `users.id_department`                          | `departments.id_department`  | `FK_users_departments`                  |
| `refresh_tokens.id_user`                       | `users.id_user`              | `fk_refresh_tokens_user`                |
| `tickets.id_created_by`                        | `users.id_user`              | `FK_ticket_created_by`                  |
| `tickets.id_requested_for`                     | `users.id_user`              | `FK_ticket_requested_for`               |
| `tickets.id_assigned_to`                       | `users.id_user`              | `FK_ticket_assigned_to`                 |
| `tickets.id_category`                          | `categories.id_category`     | `FK_ticket_category`                    |
| `tickets.id_priority`                          | `priorities.id_priority`     | `FK_ticket_priority`                    |
| `tickets.id_status`                            | `statuses.id_status`         | `FK_ticket_status`                      |
| `ticket_comments.id_ticket`                    | `tickets.id_ticket`          | `fk_ticket_comments_ticket`             |
| `ticket_comments.id_user`                      | `users.id_user`              | `fk_ticket_comments_user`               |
| `ticket_history.id_ticket`                     | `tickets.id_ticket`          | `fk_ticket_history_ticket`              |
| `ticket_history.id_user`                       | `users.id_user`              | `fk_ticket_history_user`                |
| `ticket_attachments.id_ticket`                 | `tickets.id_ticket`          | `fk_ticket_attachments_ticket`          |
| `ticket_attachments.id_uploaded_by`            | `users.id_user`              | `fk_ticket_attachments_user`            |
| `ticket_comment_attachments.id_ticket_comment` | `ticket_comments.id_comment` | `fk_ticket_comment_attachments_comment` |
| `ticket_comment_attachments.id_uploaded_by`    | `users.id_user`              | `fk_ticket_comment_attachments_user`    |
| `user_avatars.id_user`                         | `users.id_user`              | `fk_user_avatars_user`                  |

`id_created_by` identifica al usuario que presentó el ticket. `id_requested_for` identifica al usuario que necesita soporte y puede coincidir con quien creó el ticket. Ambos campos son obligatorios. `id_assigned_to` identifica al técnico responsable y puede ser `NULL` mientras el ticket esté sin asignar. Spring Boot valida el rol del usuario asignado. Las tres claves foráneas hacen referencia a `users`.

### Catálogos de referencia iniciales

[02_seed_reference_data.sql](./02_seed_reference_data.sql) carga los siguientes catálogos. Todas las entradas iniciales de los catálogos que tienen el indicador `active` se crean activas.

| Catálogo           | Valores iniciales                                                                                                                                                                          | Reglas de administración                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roles (3)          | `ADMIN`, `TECHNICIAN`, `USER`                                                                                                                                                              | Roles fijos de la aplicación. La API de roles es de solo lectura.                                                                                                                                                                        |
| Departamentos (14) | IT, Finance, Human Resources, Sales, Marketing, Legal, Operations, Security, Customer Support, Procurement, Facilities, Logistics, Product Development, Quality Assurance                  | Los administradores pueden crear, editar, activar y desactivar departamentos.                                                                                                                                                            |
| Categorías (14)    | Hardware, Software, Network, Access, Security, Email, Printers and Scanners, Mobile Devices, Remote Access, Cloud Services, Backup and Recovery, Collaboration Tools, Databases, Telephony | Los administradores pueden crear, editar, activar y desactivar categorías.                                                                                                                                                               |
| Prioridades (6)    | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `VERY_LOW`, `URGENT`                                                                                                                                  | El backend impide editar o desactivar `LOW`, `MEDIUM`, `HIGH` y `CRITICAL`. Los administradores pueden gestionar prioridades personalizadas como `VERY_LOW` y `URGENT`. El contador de tickets críticos solo tiene en cuenta `CRITICAL`. |
| Estados (5)        | `OPEN`, `IN_PROGRESS`, `BLOCKED`, `RESOLVED`, `CLOSED`                                                                                                                                     | El backend impide editar o desactivar los cinco estados iniciales. Los administradores pueden crear y gestionar estados adicionales.                                                                                                     |

## Almacenamiento híbrido de archivos

Spring Boot almacena los archivos binarios mediante GridFS en la base de datos `helpdesk_attachments`. MySQL guarda los metadatos de cada archivo.

| Tabla de metadatos en MySQL  | Identificador de fila | Usuario asociado | Bucket de MongoDB GridFS |
| ---------------------------- | --------------------- | ---------------- | ------------------------ |
| `ticket_attachments`         | `id_attachment`       | `id_uploaded_by` | `ticket_files`           |
| `ticket_comment_attachments` | `id_attachment`       | `id_uploaded_by` | `ticket_comment_files`   |
| `user_avatars`               | `id_avatar`           | `id_user`        | `user_avatars`           |

Cada fila guarda `file_name`, `content_type` (tipo MIME), `file_size` (en bytes) y `mongo_file_id`. Este último campo contiene el ObjectId hexadecimal de 24 caracteres del archivo GridFS en el bucket correspondiente. Su valor es único dentro de cada tabla SQL de metadatos. La restricción `uq_user_avatars_user` limita los metadatos del avatar a una fila por usuario.

Cada bucket de GridFS utiliza su propia colección `.files` para los registros de archivos y una colección `.chunks` para los fragmentos binarios. Por ejemplo, el bucket `ticket_files` utiliza `ticket_files.files` y `ticket_files.chunks`. GridFS crea las colecciones a medida que las necesita, por lo que una base de datos recién creada puede carecer de colecciones hasta que se suba un archivo a un bucket. MongoDB no necesita un script SQL de inicialización.

MySQL y MongoDB no comparten una transacción distribuida. El backend intenta limpiar los archivos en los siguientes casos.

- **Adjuntos de tickets y comentarios.** El backend almacena primero el archivo binario y envía de inmediato la escritura de los metadatos a MySQL. Si esa operación lanza una excepción, el backend intenta eliminar el nuevo archivo de GridFS.
- **Subida o sustitución del avatar.** El backend intenta eliminar el nuevo archivo de GridFS si se revierte la transacción SQL. Si la transacción se confirma, intenta eliminar el archivo anterior, si existía.
- **Eliminación del avatar.** El backend elimina la fila de SQL e intenta eliminar el archivo de GridFS después de confirmar la transacción SQL.

La limpieza se realiza sin garantía de éxito. Si falla, puede quedar un archivo sin referencia en GridFS. Las copias de seguridad y las restauraciones deben abarcar tanto los metadatos como los archivos.

## Scripts SQL de inicialización

Ejecuta en orden los scripts que correspondan al preparar una base de datos nueva. El script de `local/` es un paso de preparación manual.

| Script                              | Descripción                                                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `local/00_setup_local_database.sql` | Crea `helpdesk` con `utf8mb4` y `utf8mb4_0900_ai_ci` y muestra su definición. Configura la cuenta de MySQL y sus permisos por separado cuando sea necesario.                                                             |
| `01_create_tables.sql`              | Crea las 13 tablas, sus relaciones y sus restricciones.                                                                                                                                                                  |
| `02_seed_reference_data.sql`        | Carga los roles, departamentos, categorías, prioridades y estados iniciales.                                                                                                                                             |
| `03_seed_admin.sql`                 | Crea el administrador privado de la aplicación `admin` cuando el propietario ha preparado este archivo local. [database/.gitignore](./.gitignore) lo excluye de Git y el archivo no se incluye al clonar el repositorio. |
| `04_seed_demo_data.sql`             | Carga las cuentas públicas de demostración, usuarios de prueba adicionales, tickets de ejemplo, comentarios e historial. Inclúyelo en los entornos de prueba y en la demostración del portafolio.                        |

Los scripts del esquema y de datos iniciales están pensados para una base de datos nueva y vacía. Ejecuta `01` y después `02`. Ejecuta `03` si dispones del script privado y luego `04` si necesitas los datos de demostración. El script de demostración consulta los catálogos cargados por `02` y utiliza las cuentas que él mismo inserta, incluida `admin_demo`. Puede ejecutarse después de `02` sin el script privado. Los scripts del esquema y de datos iniciales no están diseñados para ejecutarse repetidamente. El proyecto no tiene una herramienta de migración automática del esquema.

## Configuración con Docker (recomendada)

Desde la raíz del repositorio, configura `.env` o `.env.dev` según las indicaciones del [README principal](../README.es.md#puesta-en-marcha-con-docker). Arranca el entorno que quieras utilizar.

```bash
# Compiled environment
docker compose up -d --build

# Development environment
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

Ambos archivos de Compose utilizan `mysql:8.4` y `mongo:8.0`. Durante la primera inicialización con un volumen de datos MySQL vacío, la imagen de MySQL crea la base de datos `helpdesk` y la cuenta de base de datos de la aplicación mediante `MYSQL_DATABASE`, `MYSQL_USER` y `MYSQL_PASSWORD`. El directorio `database/` se monta en modo de solo lectura en `/docker-entrypoint-initdb.d`. MySQL ejecuta por orden de nombre los archivos SQL situados en la raíz de ese directorio, incluido `03_seed_admin.sql` solo si existe en local. El punto de entrada de la imagen no ejecuta el script de `database/local/`.

La comprobación de estado de MySQL ejecuta `SELECT 1` por TCP con la cuenta de base de datos configurada para la aplicación. La comprobación de MongoDB ejecuta `db.adminCommand('ping')`. El backend espera a que ambas comprobaciones sean satisfactorias. Los puertos de las bases de datos están disponibles en la red de Compose y no se publican en el equipo anfitrión.

### Volúmenes persistentes

| Datos   | Volumen DEV               | Volumen PROD local         |
| ------- | ------------------------- | -------------------------- |
| MySQL   | `helpdesk-dev_mysql_data` | `helpdesk-prod_mysql_data` |
| MongoDB | `helpdesk-dev_mongo_data` | `helpdesk-prod_mongo_data` |

Cada entorno utiliza sus propios volúmenes con nombre. Volver a crear los contenedores conserva los datos de esos volúmenes. Si se reutiliza un volumen MySQL ya inicializado, se omite la ejecución de los scripts SQL, aunque los archivos hayan cambiado. Aplica explícitamente los cambios de esquema a las bases de datos existentes cuando sea necesario.

**Advertencia.** `docker compose down -v` puede eliminar los volúmenes con nombre del proyecto seleccionado y borrar de forma permanente sus datos persistentes de MySQL y MongoDB. Para detener el entorno de forma habitual, utiliza `docker compose down` o el comando equivalente de DEV sin la opción de volúmenes.

Para conservar los adjuntos y avatares, coordina las copias de seguridad y las restauraciones de ambas bases de datos. La copia de MySQL contiene las referencias a los archivos. El contenido binario debe copiarse desde la base de datos MongoDB correspondiente.

## Configuración manual (sin Docker)

Utiliza MySQL 8.4 u otro servidor MySQL 8 compatible, MongoDB 8.0 y un cliente SQL como el cliente de línea de comandos `mysql` o MySQL Workbench.

1. Arranca MySQL y MongoDB en local.
2. Conéctate con una cuenta de MySQL autorizada para crear la base de datos e inicializar el esquema. Si usas el cliente de línea de comandos `mysql`, inícialo desde la raíz del repositorio y ejecuta los archivos SQL con `SOURCE`. En MySQL Workbench, abre y ejecuta los archivos en el mismo orden.

   ```sql
   SOURCE database/local/00_setup_local_database.sql;
   SOURCE database/01_create_tables.sql;
   SOURCE database/02_seed_reference_data.sql;
   ```

   Ejecuta `SOURCE database/03_seed_admin.sql;` si has preparado el script del administrador privado. Ejecuta `SOURCE database/04_seed_demo_data.sql;` si quieres cargar los datos de demostración.

3. Comprueba que la cuenta utilizada por Spring Boot puede conectarse y tiene los permisos necesarios sobre `helpdesk`. La creación del esquema no configura la cuenta de base de datos de la aplicación. Las credenciales de conexión a MySQL son distintas de las credenciales de inicio de sesión en la aplicación.
4. Configura las variables de entorno que usa el backend para conectarse a las bases de datos. Sustituye el nombre de usuario y la contraseña del ejemplo por los de la cuenta de MySQL de la aplicación.

```dotenv
DB_URL=jdbc:mysql://localhost:3306/helpdesk
DB_USERNAME=helpdesk
DB_PASSWORD=replace_with_your_password
MONGODB_URI=mongodb://localhost:27017/helpdesk_attachments
```

La URI local de MongoDB coincide con el valor predeterminado de [application.properties](../back-end/src/main/resources/application.properties). MongoDB crea el almacenamiento a medida que GridFS lo necesita. Completa la inicialización SQL antes de arrancar Spring Boot. Configura el resto de las variables del backend según el [README del backend](../back-end/README.es.md). Mantén las credenciales reales fuera de Git.

## Cuentas y datos de demostración

El [script de datos de demostración](./04_seed_demo_data.sql) crea estas tres cuentas públicas para la demostración del portafolio. Sus credenciales están recogidas en el apartado [Cuentas de demostración del README principal](../README.es.md#cuentas-de-demostración).

| Nombre de usuario | Rol          |
| ----------------- | ------------ |
| `admin_demo`      | `ADMIN`      |
| `technician_demo` | `TECHNICIAN` |
| `user_demo`       | `USER`       |

| Registros insertados por `04_seed_demo_data.sql` | Cantidad |
| ------------------------------------------------ | -------: |
| Usuarios, incluidas las tres cuentas públicas    |       15 |
| Tickets                                          |       60 |
| Comentarios de tickets                           |      175 |
| Eventos del historial de tickets                 |      218 |

La cuenta privada de la aplicación `admin` se crea por separado mediante `03_seed_admin.sql` cuando el archivo está disponible. Un esquema nuevo inicializado con ambos archivos tiene 16 usuarios. El script de demostración guarda hashes BCrypt de las contraseñas e incluye tickets que varían por usuario que los crea, usuario que recibe el soporte, técnico asignado, prioridad, categoría y estado. Incluye tickets sin asignar y comentarios tanto públicos como internos.

## Verificación de la configuración

### Esquema y datos iniciales de MySQL

Si el nombre de usuario de MySQL configurado para la aplicación es distinto, úsalo en lugar de `helpdesk`. La opción `-p` solicita la contraseña.

```bash
# Manual MySQL installation
mysql -h 127.0.0.1 -P 3306 -u helpdesk -p helpdesk

# Docker PROD
docker compose exec mysql mysql -u helpdesk -p helpdesk

# Docker DEV
docker compose --env-file .env.dev -f docker-compose.dev.yaml exec mysql mysql -u helpdesk -p helpdesk
```

Ejecuta estas comprobaciones de solo lectura. En una base de datos recién inicializada con los scripts correspondientes, compara los recuentos con los totales de los catálogos de referencia y los datos de demostración indicados arriba.

```sql
USE helpdesk;
SHOW TABLES;

SELECT 'roles' AS catalog, COUNT(*) AS total FROM roles
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'priorities', COUNT(*) FROM priorities
UNION ALL SELECT 'statuses', COUNT(*) FROM statuses;

SELECT u.username, r.name AS role
FROM users u
JOIN roles r ON u.id_role = r.id_role
WHERE u.username IN ('admin', 'admin_demo', 'technician_demo', 'user_demo')
ORDER BY u.username;

SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_tickets FROM tickets;
SELECT COUNT(*) AS total_comments FROM ticket_comments;
SELECT COUNT(*) AS total_history_events FROM ticket_history;
```

### MongoDB e integridad de los archivos

Abre `mongosh` en el entorno que quieras comprobar.

```bash
# Manual MongoDB installation
mongosh "mongodb://localhost:27017/helpdesk_attachments"

# Docker PROD
docker compose exec mongodb mongosh helpdesk_attachments

# Docker DEV
docker compose --env-file .env.dev -f docker-compose.dev.yaml exec mongodb mongosh helpdesk_attachments
```

```text
db.runCommand({ ping: 1 })
show collections
```

Un ping correcto confirma que MongoDB responde. En un entorno recién creado es normal que la lista de colecciones esté vacía antes de subir archivos. Para comprobar el almacenamiento de principio a fin, arranca la aplicación, sube un archivo de prueba y consulta sus metadatos en la tabla correspondiente. El ejemplo siguiente incluye los recuentos de metadatos y la fila del último adjunto de ticket.

```sql
SELECT COUNT(*) AS total_ticket_attachments FROM ticket_attachments;
SELECT COUNT(*) AS total_comment_attachments FROM ticket_comment_attachments;
SELECT COUNT(*) AS total_avatars FROM user_avatars;

SELECT id_attachment, id_ticket, id_uploaded_by, file_name, content_type, file_size, mongo_file_id
FROM ticket_attachments
ORDER BY id_attachment DESC
LIMIT 1;
```

En `mongosh`, sustituye el ObjectId del ejemplo por el `mongo_file_id` de esa fila. Comprueba el registro del archivo y sus fragmentos binarios.

```javascript
const fileId = ObjectId("000000000000000000000000")
db.getCollection("ticket_files.files").findOne({ _id: fileId }, { filename: 1, length: 1 })
db.getCollection("ticket_files.chunks").countDocuments({ files_id: fileId })
```

Compara el nombre y el tamaño en bytes del archivo de GridFS con los metadatos de SQL y recupera el archivo desde la interfaz. Para un adjunto de comentario o un avatar, utiliza la tabla SQL y el bucket de GridFS que figuran en la correspondencia anterior.

## Bases de datos locales y en la nube

| Entorno | Almacenamiento relacional                            | Almacenamiento de archivos binarios | Configuración del backend                                                                                                                                                                |
| ------- | ---------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local   | MySQL en Docker o instalado directamente             | GridFS en MongoDB local             | Compose proporciona los parámetros de conexión a los servicios. Para la configuración manual, establece `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` y `MONGODB_URI` según lo indicado arriba. |
| Nube    | TiDB Cloud mediante su interfaz compatible con MySQL | GridFS en MongoDB Atlas             | Spring Boot se ejecuta en Render. Configura allí las mismas variables de entorno con los valores de los servicios alojados.                                                              |

Consulta la [arquitectura en la nube del README principal](../README.es.md#arquitectura-en-la-nube) para conocer el contexto de la aplicación.

## Consideraciones para el despliegue

Los archivos de Compose incluidos están pensados para uso local y no configuran la autenticación de MongoDB. En los entornos alojados, habilita la autenticación de las bases de datos, utiliza cuentas con los permisos mínimos necesarios, guarda las credenciales como secretos de despliegue y prepara procedimientos coordinados de copia de seguridad y restauración para ambas bases de datos.

La demostración pública del portafolio utiliza exclusivamente datos de prueba. Spring Boot permite a `admin_demo` gestionar cuentas no protegidas de usuarios normales y técnicos, y le impide editar `admin`, `admin_demo`, `technician_demo` y `user_demo` o conceder el rol `ADMIN`. Las tres cuentas públicas pueden subir, sustituir y eliminar sus propios avatares. Sus datos personales son de solo lectura y el cambio de contraseña está deshabilitado. La cuenta privada `admin` es independiente de la demostración pública.

En un entorno empresarial real de producción, excluye el script de datos de demostración y las cuentas públicas de demostración. Revisa la seguridad y los procedimientos operativos antes de utilizar datos empresariales.
