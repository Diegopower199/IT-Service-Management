# Help Desk — Backend

[English](./README.md) | **Español**

API REST para una aplicación full stack de **gestión de servicios de TI (ITSM)**. Gestiona la autenticación, los usuarios, los tickets y sus asignaciones, los comentarios, el historial de auditoría, las estadísticas del panel de control, los adjuntos y los avatares de usuario.

## Tecnologías

- **Java 17** · **Spring Boot 4.1.1** · Spring MVC
- **Spring Security 7.1.1** · JWT (HS256) · BCrypt
- **Spring Data JPA** · Hibernate · **MySQL 8.4**
- **Spring Data MongoDB** · **MongoDB 8.0** · GridFS
- Jakarta Bean Validation · Lombok
- **JUnit Jupiter 6.0.3** · Mockito · Spring MockMvc · Maven Wrapper (Maven 3.10.0)

## Funcionalidades

- Autenticación con tokens de acceso JWT de corta duración y tokens de renovación con rotación.
- Acceso basado en los roles `ADMIN`, `TECHNICIAN` y `USER`.
- Administración de usuarios, gestión de perfiles personales y cambios de contraseña.
- Creación, edición y asignación de tickets, y gestión de sus prioridades y estados.
- Búsqueda de tickets con paginación, ordenación y filtros.
- Comentarios públicos e internos e historial auditable de cambios.
- Estadísticas del panel de control en función del rol.
- Subida, descarga y vista previa de adjuntos de tickets y comentarios con autenticación.
- Subida, sustitución y eliminación de avatares de usuario.
- Validación de peticiones y respuestas de error coherentes.

## Estructura del proyecto

```text
src/
├── main/
│   ├── java/com/example/back_end/
│   │   ├── config/          # Application and security configuration
│   │   ├── controller/      # REST endpoints
│   │   ├── dtos/            # Request and response DTOs
│   │   ├── enums/           # Domain and storage enums
│   │   ├── exception/       # Error handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Database access
│   │   ├── security/        # JWT and security filters
│   │   ├── service/         # Business logic
│   │   ├── specification/   # Dynamic ticket filtering
│   │   └── utils/           # Shared utilities
│   └── resources/application.properties
└── test/java/com/example/back_end/
```

El backend es una aplicación Spring Boot organizada por capas.

| Paquete         | Responsabilidad                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `controller`    | Define las rutas REST, gestiona la validación de las peticiones y construye las respuestas HTTP.             |
| `service`       | Aplica las reglas de negocio y la autorización sobre cada recurso. Coordina las operaciones de SQL y GridFS. |
| `repository`    | Accede a los datos relacionales mediante Spring Data JPA.                                                    |
| `dtos`          | Define los datos de entrada y salida de la API, incluidas sus restricciones de validación.                   |
| `model`         | Mapea las entidades del dominio y sus relaciones a tablas SQL.                                               |
| `security`      | Emite y valida JWT, autentica peticiones y gestiona los errores de autenticación.                            |
| `specification` | Combina predicados de JPA para buscar y filtrar tickets.                                                     |
| `exception`     | Convierte las excepciones de la aplicación y de validación en respuestas HTTP de error.                      |

## Requisitos

- JDK 17 o posterior
- MySQL 8.4 (Docker utiliza `mysql:8.4`)
- MongoDB 8.0 (Docker utiliza `mongo:8.0`)
- Maven Wrapper (incluido en el repositorio)

## Preparación de la base de datos

Los scripts SQL del directorio `database/` del repositorio inicializan el esquema `helpdesk`. Para la instalación manual, ejecuta primero `local/00_setup_local_database.sql` para crear la base de datos. Después, configura una cuenta de MySQL dedicada con los permisos que necesita el backend en ejecución.

Ejecuta los scripts restantes en este orden sobre un esquema nuevo.

1. `01_create_tables.sql` crea las tablas y sus relaciones, incluidas las tablas de metadatos de archivos.
2. `02_seed_reference_data.sql` carga los catálogos de referencia.
3. `03_seed_admin.sql` inicializa el administrador privado si el propietario ha preparado el archivo en local. Este archivo está excluido del repositorio Git.
4. `04_seed_demo_data.sql` carga las cuentas de demostración, los tickets, los comentarios y el historial.

Completa la inicialización del esquema antes de iniciar Spring Boot. Hibernate valida las tablas existentes mediante la siguiente propiedad de `src/main/resources/application.properties`.

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Docker monta `database/` en `/docker-entrypoint-initdb.d` en modo de solo lectura. MySQL ejecuta los archivos SQL de la raíz de ese directorio por orden al inicializar por primera vez un volumen vacío. Cuando se reutiliza un volumen, MySQL omite los scripts de inicialización. Utiliza `database/local/` para la instalación manual.

MySQL almacena los registros relacionales y los metadatos de los archivos. MongoDB almacena los archivos binarios en GridFS y utiliza `helpdesk_attachments` por defecto en los entornos locales. Las colecciones de GridFS se crean cuando se necesitan. Consulta el [README de la base de datos](../database/README.md).

## Configuración

Define estas variables antes de iniciar el backend.

| Variable       | Ejemplo o finalidad                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DB_URL`       | `jdbc:mysql://localhost:3306/helpdesk`                                                                               |
| `DB_USERNAME`  | Nombre de usuario de MySQL para la aplicación.                                                                       |
| `DB_PASSWORD`  | Contraseña de MySQL para la aplicación.                                                                              |
| `JWT_SECRET`   | Clave de firma codificada en Base64 (al menos 32 bytes aleatorios antes de codificarla).                             |
| `FRONTEND_URL` | Origen del frontend permitido por CORS con credenciales. Para la ejecución manual en local, `http://localhost:3000`. |

Variables opcionales

| Variable                              | Valor por defecto                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `SERVER_PORT`                         | El valor de `PORT`, si está definido. En caso contrario, `8080`.                  |
| `PORT`                                | Puerto alternativo que utiliza el servidor cuando `SERVER_PORT` no está definido. |
| `MONGODB_URI`                         | `mongodb://localhost:27017/helpdesk_attachments`                                  |
| `JWT_ACCESS_TOKEN_EXPIRATION_MINUTES` | `15`                                                                              |
| `JWT_REFRESH_TOKEN_EXPIRATION_DAYS`   | `7`                                                                               |
| `COOKIE_SECURE`                       | `false`. Establécela en `true` para despliegues con HTTPS.                        |

Para la ejecución en local, utiliza la configuración de conexión de las instancias locales de MySQL y MongoDB. Compose proporciona los nombres de host de sus servicios y asigna los valores de los archivos de entorno de la raíz a las variables del backend. En Render, utiliza la URL JDBC compatible con MySQL de TiDB Cloud en `DB_URL`, las credenciales de la cuenta de la base de datos en `DB_USERNAME` y `DB_PASSWORD` y la URI de conexión de Atlas en `MONGODB_URI`. Configura `FRONTEND_URL` con el origen del frontend en Vercel.

Guarda las credenciales y las URI de conexión de las bases de datos de producción, así como `JWT_SECRET`, en el entorno de despliegue y mantenlas fuera de Git. Usa los [ejemplos de generación de claves JWT](../README.es.md#clave-de-firma-de-jwt) para generar la clave.

## Ejecutar con Docker

Para ejecutar la aplicación completa, se recomienda usar Docker Compose desde la raíz del repositorio. Configura los archivos de entorno como se describe en el [README principal](../README.es.md).

```bash
# Compiled environment
docker compose up -d --build

# Development environment
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

- API de PROD local en `http://localhost:8080/api/v1`.
- API de DEV en `http://localhost:8081/api/v1`.
- Dentro de Docker, el backend se conecta a `mysql:3306` y `mongodb:27017` mediante la red de Compose.
- El Dockerfile de producción compila un JAR en una etapa con Maven y lo ejecuta en un JRE de Java 17. El empaquetado omite las pruebas. Ejecútalas por separado.
- El Dockerfile de desarrollo ejecuta Maven con el código fuente montado en el contenedor. Para activar los reinicios automáticos cuando cambie el código Java o la configuración de Maven, ejecuta el siguiente comando en otra terminal desde la raíz.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

Docker PROD ejecuta en local el backend compilado. Consulta el [flujo de trabajo con Docker](../DOCKER-WORKFLOW.md) para ver más comandos.

## Ejecutar en local (sin Docker)

Inicia MySQL y MongoDB, inicializa el esquema y define las variables de entorno. Ejecuta Maven Wrapper desde `back-end/`. Consulta la [instalación manual](../README.es.md#instalación-manual-sin-docker).

**Windows PowerShell**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux o macOS**

```bash
chmod u+x mvnw
./mvnw spring-boot:run
```

La URL base de la API es **`http://localhost:8080/api/v1`**.

## Despliegue en la nube

Render aloja la API de Spring Boot y proporciona su entorno de ejecución, incluida `PORT` como alternativa a `SERVER_PORT`. La API se conecta a TiDB Cloud y MongoDB Atlas mediante las mismas [variables de configuración](#configuración) que se usan en local. Vercel reenvía a Render las peticiones a `/api/v1` mediante una regla de reescritura de Next.js. Consulta la [arquitectura en la nube del README principal](../README.es.md#arquitectura-en-la-nube).

## Autenticación y autorización

Las siguientes rutas de autenticación son relativas a `/api/v1`. Spring Security funciona sin sesión HTTP y utiliza un `PasswordEncoder` de BCrypt para verificar las contraseñas.

- `POST /auth/login` verifica el nombre de usuario y la contraseña, devuelve un JWT de corta duración firmado con HS256 y establece la cookie del token de renovación.
- Las peticiones protegidas usan `Authorization: Bearer <access-token>`. El filtro JWT valida el token y carga de la base de datos los permisos del usuario habilitado.
- `POST /auth/refresh` lee el token de renovación de la cookie, lo valida y lo revoca. A continuación, emite una cookie con un token de renovación nuevo y devuelve un nuevo token de acceso. La tabla `refresh_tokens` almacena los hashes SHA-256 de los tokens de renovación.
- `POST /auth/logout` revoca el token de renovación si se ha proporcionado y hace caducar su cookie. Los tokens de acceso emitidos anteriormente siguen sujetos a las comprobaciones habituales de validación de JWT.

La cookie del token de renovación es `HttpOnly`, usa `SameSite=Strict` y está limitada a `/api/v1/auth`. `COOKIE_SECURE` controla su atributo `Secure`.

### Acceso por rol y recurso

Spring Security comprueba los roles requeridos por cada endpoint. Los servicios de la aplicación utilizan la cuenta autenticada para comprobar su relación con cada recurso. Los administradores crean las cuentas de usuario mediante la API de usuarios.

| Rol          | Detalle del ticket y recursos relacionados                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`      | Acceso a todos los tickets.                                                                                                                                                                       |
| `TECHNICIAN` | Acceso a los tickets asignados al técnico y a los tickets sin asignar. Para editar los datos del ticket o subir adjuntos directamente al ticket, este debe estar asignado al técnico autenticado. |
| `USER`       | Acceso a los tickets que ha creado o que se han solicitado para él. El acceso a los comentarios se limita a los públicos.                                                                         |

Operaciones como la asignación y los cambios en el flujo de trabajo tienen sus propios requisitos de autorización. Consulta la [referencia de la API](#referencia-de-la-api).

### Cuentas de demostración

- `admin_demo` tiene el rol `ADMIN`. Puede crear y gestionar cuentas `USER` y `TECHNICIAN` no protegidas. `DemoAccountAccess` impide que `admin_demo` edite las cuentas `admin`, `admin_demo`, `technician_demo` y `user_demo` o conceda `ADMIN`.
- `technician_demo` y `user_demo` conservan los permisos habituales de sus roles para tickets y comentarios.
- Las tres cuentas de demostración tienen los datos personales en modo de solo lectura y el cambio de contraseña deshabilitado. Cada una puede subir, reemplazar y eliminar su propio avatar mediante las rutas de perfil autenticadas.
- La cuenta privada `admin` conserva los permisos administrativos habituales. Mantén sus credenciales en privado. Consulta las [cuentas públicas de demostración](../README.es.md#cuentas-de-demostración).

## Almacenamiento de archivos

La aplicación separa los metadatos relacionales del contenido binario de los archivos. MySQL almacena el nombre del archivo, su tipo de contenido, tamaño, entidad propietaria, marcas de tiempo e identificador en GridFS. MongoDB almacena el archivo.

| Funcionalidad           | Tabla de MySQL               | Bucket de GridFS       | Formatos admitidos | Tamaño máximo |
| ----------------------- | ---------------------------- | ---------------------- | ------------------ | ------------- |
| Adjuntos de tickets     | `ticket_attachments`         | `ticket_files`         | PDF, JPEG, PNG     | 10 MiB        |
| Adjuntos de comentarios | `ticket_comment_attachments` | `ticket_comment_files` | PDF, JPEG, PNG     | 10 MiB        |
| Avatares de usuario     | `user_avatars`               | `user_avatars`         | JPEG, PNG          | 5 MiB         |

`MongoGridFsConfig` configura los tres buckets. Las subidas utilizan datos de formulario multipart con el campo `file`. El backend rechaza los archivos vacíos o demasiado grandes, normaliza sus nombres y detecta el tipo de archivo mediante su firma binaria. Al subir un avatar también comprueba que el tipo de contenido declarado coincida con el detectado. Los límites del servlet son `10MB` por archivo multipart y `11MB` por petición.

Para listar, descargar o previsualizar un adjunto se requiere acceso al ticket al que pertenece. En los adjuntos de comentarios también se comprueba la visibilidad del comentario. Para subir archivos a un comentario hay que ser su autor. Las descargas se sirven como archivos adjuntos y las vistas previas se muestran en línea. Las respuestas binarias incluyen `Cache-Control: no-store` y `X-Content-Type-Options: nosniff`. Las rutas de avatar permiten al propietario autenticado subir, reemplazar y eliminar su foto, incluidas las tres cuentas de demostración.

Las escrituras en SQL y las operaciones de GridFS se ejecutan por separado. Al subir archivos a tickets o comentarios, el servicio intenta eliminar el archivo nuevo de GridFS si falla el guardado de sus metadatos SQL. Al reemplazar un avatar, se programa la eliminación del archivo antiguo de GridFS tras confirmar la transacción SQL, o la del archivo nuevo si se revierte. Al eliminar un avatar, se borran los metadatos SQL y se intenta eliminar el archivo de GridFS tras confirmar la transacción. La limpieza se realiza en la medida de lo posible.

## Referencia de la API

Todas las rutas siguientes son relativas a `/api/v1`. Las rutas requieren autenticación Bearer salvo cuando la tabla indique el uso de credenciales o de la cookie de renovación.

### Autenticación y usuarios

| Método        | Ruta                     | Acceso y finalidad                                                                                                           |
| ------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `POST`        | `/auth/login`            | Autenticar con nombre de usuario y contraseña.                                                                               |
| `POST`        | `/auth/refresh`          | Renovar una sesión mediante una cookie de renovación válida.                                                                 |
| `POST`        | `/auth/logout`           | Borrar la cookie y revocar su token de renovación si se ha proporcionado.                                                    |
| `GET`, `POST` | `/users`                 | `ADMIN`. Listar o crear usuarios. La creación está sujeta a las restricciones de las cuentas de demostración.                |
| `GET`, `PUT`  | `/users/{id}`            | `ADMIN`. Consultar o editar un usuario. La edición está sujeta a las restricciones de las cuentas de demostración.           |
| `GET`         | `/users/me`              | Consultar el perfil del usuario autenticado.                                                                                 |
| `PUT`         | `/users/me`              | Editar los datos personales del usuario autenticado. Las cuentas de demostración tienen estos datos en modo de solo lectura. |
| `PUT`         | `/users/change-password` | Cambiar la contraseña del usuario autenticado. Las cuentas de demostración tienen esta acción deshabilitada.                 |
| `GET`         | `/users/options`         | `ADMIN` o `TECHNICIAN`. Listar los usuarios habilitados para poder seleccionarlos.                                           |
| `GET`         | `/users/technicians`     | `ADMIN` o `TECHNICIAN`. Listar los técnicos habilitados.                                                                     |
| `GET`         | `/roles`                 | `ADMIN`. Listar los roles predefinidos.                                                                                      |
| `GET`         | `/roles/{id}`            | `ADMIN`. Consultar un rol predefinido.                                                                                       |

### Catálogos

En la tabla, `<catalog>` corresponde a una de las rutas base `/departments`, `/categories`, `/priorities` o `/statuses`.

| Método  | Ruta                        | Acceso y finalidad                                             |
| ------- | --------------------------- | -------------------------------------------------------------- |
| `GET`   | `<catalog>`                 | Usuarios autenticados. Listar las entradas.                    |
| `GET`   | `<catalog>/active`          | Usuarios autenticados. Listar las entradas activas.            |
| `GET`   | `<catalog>/{id}`            | Usuarios autenticados. Consultar una entrada.                  |
| `POST`  | `<catalog>`                 | `ADMIN`. Crear una entrada.                                    |
| `PUT`   | `<catalog>/{id}`            | `ADMIN`. Actualizar una entrada.                               |
| `PATCH` | `<catalog>/{id}/activate`   | `ADMIN`. Activar una entrada.                                  |
| `PATCH` | `<catalog>/{id}/deactivate` | `ADMIN`. Desactivar una entrada según las reglas del catálogo. |

### Tickets, comentarios, historial y estadísticas

| Método        | Ruta                                | Acceso y finalidad                                                                                                                                                                     |
| ------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`         | `/tickets`                          | `ADMIN`. Listar todos los tickets del sistema.                                                                                                                                         |
| `GET`         | `/tickets/my`                       | Listar los tickets creados por el usuario autenticado o solicitados para él.                                                                                                           |
| `GET`         | `/tickets/assigned`                 | `TECHNICIAN`. Listar los tickets asignados al técnico autenticado.                                                                                                                     |
| `GET`         | `/tickets/unassigned`               | `TECHNICIAN`. Listar los tickets sin técnico asignado, con filtros y paginación.                                                                                                       |
| `GET`         | `/tickets/{id}`                     | Consultar un ticket conforme a las [reglas de acceso a tickets](#acceso-por-rol-y-recurso).                                                                                            |
| `POST`        | `/tickets`                          | Crear un ticket. Las cuentas con rol `USER` pueden crear tickets para sí mismas.                                                                                                       |
| `PATCH`       | `/tickets/{id}`                     | Editar los datos del ticket según las reglas de acceso. El ticket debe estar asignado al técnico que lo edita.                                                                         |
| `PATCH`       | `/tickets/{id}/assign`              | `ADMIN` o `TECHNICIAN` con acceso al ticket. El ticket debe asignarse a un técnico.                                                                                                    |
| `PATCH`       | `/tickets/{id}/priority`            | `ADMIN` o `TECHNICIAN` con acceso al ticket. Cambiar la prioridad.                                                                                                                     |
| `PATCH`       | `/tickets/{id}/status`              | `ADMIN` o `TECHNICIAN` con acceso al ticket. Cambiar el estado.                                                                                                                        |
| `GET`, `POST` | `/ticket-comments/ticket/{id}`      | Listar o añadir comentarios con acceso al ticket. Los comentarios internos se limitan a administradores y técnicos con acceso al ticket.                                               |
| `GET`         | `/ticket-history`                   | `ADMIN` puede consultar todo el historial. `TECHNICIAN` puede consultar el historial de los tickets asignados al técnico y de los tickets sin asignar.                                 |
| `GET`         | `/ticket-history/ticket/{ticketId}` | Consultar el historial de un ticket al que se tiene acceso.                                                                                                                            |
| `GET`         | `/tickets/statistics`               | Las estadísticas del panel abarcan todos los tickets para `ADMIN`, los asignados al técnico para `TECHNICIAN` y los creados por el usuario o solicitados para él en el caso de `USER`. |

### Endpoints de archivos

Los adjuntos de tickets siguen las reglas de acceso al ticket. Un técnico debe tener el ticket asignado para subir archivos directamente a él. Los adjuntos de comentarios también siguen las reglas de visibilidad del comentario, y solo el autor puede adjuntar archivos a su comentario.

| Método | Ruta                                                                           | Finalidad                                                                                           |
| ------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| GET    | `/tickets/{ticketId}/attachments`                                              | Listar los adjuntos de un ticket                                                                    |
| POST   | `/tickets/{ticketId}/attachments`                                              | Subir un adjunto a un ticket                                                                        |
| GET    | `/tickets/{ticketId}/attachments/{attachmentId}/download`                      | Descargar un archivo                                                                                |
| GET    | `/tickets/{ticketId}/attachments/{attachmentId}/preview`                       | Previsualizar un archivo                                                                            |
| GET    | `/tickets/{ticketId}/comments/{commentId}/attachments`                         | Listar los adjuntos de un comentario                                                                |
| POST   | `/tickets/{ticketId}/comments/{commentId}/attachments`                         | Subir un adjunto a un comentario                                                                    |
| GET    | `/tickets/{ticketId}/comments/{commentId}/attachments/{attachmentId}/download` | Descargar un archivo de un comentario                                                               |
| GET    | `/tickets/{ticketId}/comments/{commentId}/attachments/{attachmentId}/preview`  | Previsualizar un archivo de un comentario                                                           |
| GET    | `/users/{userId}/avatar/metadata`                                              | Consultar los metadatos del avatar como usuario autenticado.                                        |
| GET    | `/users/{userId}/avatar`                                                       | Obtener un avatar como usuario autenticado. Devuelve `204` si el usuario existe y carece de avatar. |
| PUT    | `/users/me/avatar`                                                             | Subir o reemplazar el avatar propio                                                                 |
| DELETE | `/users/me/avatar`                                                             | Eliminar el avatar propio                                                                           |

### Filtros y errores

Los endpoints que listan tickets admiten paginación y ordenación. Según el endpoint, los filtros incluyen `title`, `status`, `priority` y `category`.

Ejemplo

```http
GET /api/v1/tickets/my?status=OPEN&page=0&size=10&sort=lastUpdated,desc
Authorization: Bearer <access-token>
```

La API devuelve errores estructurados en JSON para fallos de validación, problemas de autenticación y otros errores de la aplicación.

## Pruebas

Las pruebas de controladores y servicios utilizan **JUnit Jupiter 6.0.3** y **Mockito**. Cubren la autenticación, el ciclo de vida de los tokens de renovación, los usuarios, los catálogos, los flujos de trabajo de tickets, los comentarios y el historial. Las pruebas de autorización con MockMvc cubren el acceso a tickets y adjuntos, las cuentas de demostración protegidas, la concesión del rol ADMIN, las restricciones de perfil y contraseña, y la subida, sustitución y eliminación de avatares. Estas pruebas comprueban el comportamiento de la API HTTP y de los servicios con repositorios y almacenamiento simulados.

**Windows**

```powershell
.\mvnw.cmd clean verify
```

**Linux / macOS**

```bash
./mvnw clean verify
```

Ejecuta estos comandos desde `back-end/`. Maven compila la aplicación, ejecuta las pruebas configuradas y empaqueta el backend en el ciclo que llega hasta la fase `verify`. Para las comprobaciones de integración, ejecuta el backend con MySQL y MongoDB inicializados y prueba la autenticación y las operaciones con archivos desde la aplicación.
