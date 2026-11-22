# Flujo de trabajo con Docker — IT Service Management

[English](./DOCKER-WORKFLOW.md) | **Español**

Guía para construir, ejecutar y gestionar el proyecto Help Desk con Docker.

## 1. Entornos del proyecto

| Recurso | DEV (desarrollo) | PROD local (versión compilada) |
| --- | --- | --- |
| Proyecto | `helpdesk-dev` | `helpdesk-prod` |
| Docker Compose | `docker-compose.dev.yaml` | `docker-compose.yaml` |
| Variables | `.env.dev` | `.env` |
| Dockerfiles | `Dockerfile.dev` | `Dockerfile` |
| Imagen del backend | `helpdesk-backend:dev` | `helpdesk-backend:prod` |
| Imagen del frontend | `helpdesk-frontend:dev` | `helpdesk-frontend:prod` |
| Frontend | <http://localhost:3001> | <http://localhost:3000> |
| API | `http://localhost:8081/api/v1` | `http://localhost:8080/api/v1` |
| Red predeterminada | `helpdesk-dev_default` | `helpdesk-prod_default` |

Los dos entornos incluyen el frontend Next.js (`frontend`), el backend Spring Boot (`backend`), MySQL (`mysql`, imagen `mysql:8.4`) y MongoDB (`mongodb`, imagen `mongo:8.0`). Cada proyecto dispone de su propia red y sus propios volúmenes. Solo el frontend y el backend publican puertos en el equipo anfitrión.

DEV monta el código de ambas aplicaciones. PROD local ejecuta el JAR de Spring Boot y la compilación standalone de Next.js desde imágenes construidas en tu equipo. El despliegue cloud utiliza Render y Vercel. [Arquitectura en la nube](./README.es.md#arquitectura-en-la-nube)

- Un **Dockerfile** define cómo construir una imagen.
- **Docker Compose** define cómo crear, configurar y conectar los contenedores.
- Una **imagen** empaqueta la aplicación. Un contenedor es una instancia de esa imagen.
- Un **volumen** almacena datos que deben persistir aunque se eliminen los contenedores.

## 2. Crear y arrancar los entornos

Inicia Docker Desktop o Docker Engine con el complemento Docker Compose. DEV necesita Docker Compose 2.32.0 o posterior para la acción `restart` de Watch. Ejecuta `docker compose version` para comprobar la versión y asegúrate de que los puertos del entorno elegido estén libres.

Para una instalación nueva, prepara `.env` a partir de `.env.sample` o `.env.dev` a partir de `.env.dev.sample`. Usa el archivo del entorno que vas a arrancar y sustituye las credenciales de ejemplo. [Archivos de entorno](./README.es.md#archivos-de-entorno)

| PROD local | DEV | Finalidad |
| --- | --- | --- |
| `MYSQL_ROOT_PASSWORD` | `DEV_MYSQL_ROOT_PASSWORD` | Contraseña de la cuenta root de MySQL. |
| `DB_USERNAME` | `DEV_DB_USERNAME` | Cuenta de MySQL que usa Spring Boot. El valor de ejemplo es `helpdesk`. |
| `DB_PASSWORD` | `DEV_DB_PASSWORD` | Contraseña de la cuenta de MySQL de la aplicación. |
| `JWT_SECRET` | `DEV_JWT_SECRET` | Clave de firma JWT codificada en Base64. |
| `FRONTEND_URL` | `DEV_FRONTEND_URL` | Origen permitido por el backend. Usa `http://localhost:3000` en PROD local y `http://localhost:3001` en DEV. |
| `NEXT_PUBLIC_WEB_SERVER` | `DEV_NEXT_PUBLIC_WEB_SERVER` | Nombre del host de la API desde el navegador. Usa `localhost` en ambos entornos. |
| `NEXT_PUBLIC_WEB_PORT_BACK_END` | `DEV_NEXT_PUBLIC_WEB_PORT_BACK_END` | Puerto publicado de la API. Usa `8080` en PROD local y `8081` en DEV. |

Ejecuta los comandos de esta guía desde la raíz del repositorio, salvo cuando se indique otro directorio.

### DEV — desarrollo

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml config --quiet
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

Abre <http://localhost:3001> y [activa Watch](#empezar-a-desarrollar) para trabajar en el backend.

### PROD local — validar una versión compilada

```bash
docker compose config --quiet
docker compose up -d --build
```

Abre <http://localhost:3000>. Compose utiliza por defecto `docker-compose.yaml` y `.env`.

### Qué hace `up -d --build`

1. Lee la configuración de Compose y las variables del entorno seleccionado.
2. Construye las imágenes del frontend y del backend, reutilizando la caché cuando corresponde. Descarga las imágenes oficiales si hacen falta.
3. Crea los recursos que falten y recrea los contenedores cuando cambia su configuración o su imagen. Los volúmenes existentes se vuelven a montar.
4. Inicia los servicios en segundo plano. El backend espera a que MySQL y MongoDB superen sus comprobaciones de estado. MySQL ejecuta los scripts SQL cuando inicializa un volumen vacío.

## 3. Comandos principales

### Docker — consultar recursos

| Comando | Significado |
| --- | --- |
| `docker images` | Muestra las imágenes y sus etiquetas. |
| `docker ps` | Muestra los contenedores en ejecución y sus puertos publicados. |
| `docker ps -a` | Muestra todos los contenedores, incluidos los detenidos. |
| `docker volume ls` | Muestra los volúmenes. |
| `docker network ls` | Muestra las redes. |
| `docker compose ls` | Muestra los proyectos Compose en ejecución. |

### Docker — construir una imagen manualmente

Compose puede construir las dos imágenes de la aplicación en una sola operación. Para construir solo las imágenes del backend sin Compose, ejecuta estos comandos desde `back-end/`.

```bash
docker build -t helpdesk-backend:prod .
docker build -f Dockerfile.dev -t helpdesk-backend:dev .
```

`-t` asigna un nombre y una etiqueta, `-f` selecciona el Dockerfile y `.` utiliza el directorio actual como contexto de construcción. Estos comandos solo producen imágenes.

### Docker Compose — gestionar los servicios

Antepon a las operaciones de la tabla `docker compose --env-file .env.dev -f docker-compose.dev.yaml` en DEV, o `docker compose` en PROD local.

| Operación | Significado |
| --- | --- |
| `config --quiet` | Valida la configuración de Compose sin imprimir los valores resueltos. |
| `build` | Construye las imágenes sin crear ni arrancar los contenedores. |
| `up -d` | Crea y arranca los contenedores necesarios. Reutiliza los que siguen siendo válidos y recrea los que tienen cambios de configuración o de imagen. |
| `up -d --build` | Construye las imágenes y después crea, recrea o arranca los contenedores según corresponda. |
| `start` | Arranca los contenedores existentes que están detenidos con la configuración que ya tenían. |
| `stop` | Detiene los contenedores y conserva sus volúmenes. |
| `restart backend` | Reinicia el contenedor del backend con su imagen y configuración actuales. |
| `down` | Detiene y elimina los contenedores y la red predeterminada del proyecto. Conserva las imágenes y los volúmenes con nombre. |
| `ps` / `ps -a` | Muestra los contenedores del proyecto. `-a` incluye los detenidos. |
| `logs --tail=100 backend` | Muestra las últimas 100 líneas del backend. |
| `logs -f frontend` | Sigue los logs del frontend en tiempo real. |
| `watch --no-up backend` | Vigila los cambios del backend con los servicios ya iniciados. |

| Parámetro | Significado |
| --- | --- |
| `--env-file .env.dev` | Selecciona el archivo de variables de desarrollo. |
| `-f docker-compose.dev.yaml` | Selecciona el archivo Compose de desarrollo. |
| `-d` | Ejecuta los servicios en segundo plano. |
| `--build` | Construye las imágenes antes de arrancar los servicios. |
| `--no-deps` | Arranca o actualiza el servicio indicado sin arrancar sus dependencias. |
| `--force-recreate` | Fuerza la recreación de los contenedores seleccionados al ejecutar `up`. |

Recrear un contenedor lo sustituye por uno que usa la configuración actual. Para aplicar cambios de configuración, usa `up -d`. Si el cambio afecta a lo que se incluye en la imagen, añade `--build`.

## 4. Flujo de trabajo habitual

### Empezar a desarrollar

Si ya tienes construidas las imágenes de DEV, arranca los servicios.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d
```

En otra terminal, activa Watch y déjala abierta mientras desarrollas.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

- Spring Boot se ejecuta con `mvn spring-boot:run`. Watch reinicia el contenedor al detectar cambios en `back-end/src` o `back-end/pom.xml`. Maven compila el código y resuelve dependencias al arrancar.
- Edita el código React o TypeScript en `front-end/` y comprueba los cambios en <http://localhost:3001>. Next.js se ejecuta con `npm run dev -- --webpack` y Compose habilita el sondeo de archivos con `WATCHPACK_POLLING`. Los cambios normales de código se reflejan sin reconstruir la imagen.

### Consultar el estado y los logs

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml ps -a
docker compose --env-file .env.dev -f docker-compose.dev.yaml logs --tail=100 backend mysql mongodb
docker compose --env-file .env.dev -f docker-compose.dev.yaml logs -f frontend
```

Para PROD local, usa los comandos equivalentes.

```bash
docker compose ps -a
docker compose logs --tail=100 backend mysql mongodb
docker compose logs -f frontend
```

### Actualizar PROD local con los últimos cambios

```bash
docker compose up -d --build
```

Para actualizar solo un servicio cuando sus dependencias ya están en ejecución, usa el comando correspondiente.

```bash
docker compose up -d --build --no-deps backend
docker compose up -d --build --no-deps frontend
```

### Terminar de trabajar

Pulsa `Ctrl+C` en la terminal de Watch. Detén el entorno que hayas utilizado para conservar los contenedores y sus datos.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml stop
docker compose stop
```

Usa `down` en lugar de `stop` si quieres retirar los contenedores y la red del entorno conservando sus volúmenes con nombre.

## 5. Cuándo reconstruir una imagen

| Cambio | DEV | PROD local |
| --- | --- | --- |
| Código Java | Guarda con Watch activo. Si Watch está detenido, reinicia `backend`. | Reconstruye `backend`. |
| Código React o TypeScript | Guarda y comprueba la recarga en el navegador. | Reconstruye `frontend`. |
| Dependencias Maven (`back-end/pom.xml`) | Watch reinicia `backend` y Maven resuelve los cambios con su caché. | Reconstruye `backend`. |
| Dependencias npm (`front-end/package.json` o `front-end/package-lock.json`) | Actualiza el volumen de `node_modules` con el procedimiento de abajo. | Reconstruye `frontend`. |
| Dockerfiles | Reconstruye el servicio afectado con `up -d --build`. | Reconstruye el servicio afectado con `up -d --build`. |
| Docker Compose | Valida con `config --quiet` y aplica los cambios con `up -d`. Añade `--build` si cambian las instrucciones de construcción o sus argumentos. | Valida con `config --quiet` y aplica los cambios con `up -d`. Añade `--build` si cambian las instrucciones de construcción o sus argumentos. |
| Variables del backend | Aplica los valores de `.env.dev` con `up -d backend`. | Aplica los valores de `.env` con `up -d backend`. |
| Variables públicas `NEXT_PUBLIC_*` | Aplica los valores de `.env.dev` con `up -d frontend`. Compose pasa las variables de DEV al proceso de Next.js al crear el contenedor. | Reconstruye `frontend`. El Dockerfile incorpora `NEXT_PUBLIC_WEB_SERVER` y `NEXT_PUBLIC_WEB_PORT_BACK_END` durante la compilación. |
| Scripts SQL | Aplica el cambio explícitamente si el volumen MySQL ya está inicializado. | Aplica el cambio explícitamente si el volumen MySQL ya está inicializado. |
| Configuración de Next.js (`front-end/next.config.ts`) | Reinicia `frontend` si el servidor de desarrollo aún no ha cargado la configuración montada. | Reconstruye `frontend`. |

DEV monta `back-end/` y `front-end/` en `/app` dentro de sus contenedores. Otros volúmenes mantienen la caché, los artefactos y las dependencias en sus rutas de contenedor.

| Volumen DEV | Ruta en el contenedor | Contenido |
| --- | --- | --- |
| `helpdesk-dev_backend_target` | `/app/target` | Salida de compilación de Maven. |
| `helpdesk-dev_maven_cache` | `/root/.m2` | Repositorio local y caché de Maven. |
| `helpdesk-dev_frontend_node_modules` | `/app/node_modules` | Dependencias npm instaladas. |
| `helpdesk-dev_frontend_next` | `/app/.next` | Salida y caché de desarrollo de Next.js. |

El volumen existente de `node_modules` persiste al reconstruir o recrear `frontend`. Cuando cambien las dependencias npm en DEV, ejecuta `npm ci` en un contenedor temporal que monte ese mismo volumen. Arranca después el servicio con la imagen actualizada.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml stop frontend
docker compose --env-file .env.dev -f docker-compose.dev.yaml run --rm --no-deps frontend npm ci
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build frontend
```

## 6. Inicialización y persistencia de las bases de datos

Ambos proyectos montan `database/` en modo de solo lectura en `/docker-entrypoint-initdb.d`. Durante la primera inicialización de un volumen MySQL vacío, la imagen crea `helpdesk` y la cuenta de conexión de la aplicación a partir de sus variables de entorno. Después ejecuta los scripts SQL de la raíz de `database/` por orden de nombre.

1. `01_create_tables.sql` crea las tablas y las relaciones.
2. `02_seed_reference_data.sql` carga los catálogos iniciales.
3. `03_seed_admin.sql` crea el administrador privado si el propietario ha preparado el archivo local.
4. `04_seed_demo_data.sql` carga las cuentas públicas de demostración, los tickets de ejemplo, los comentarios y el historial.

El archivo `03_seed_admin.sql` está excluido de Git y se prepara localmente. Una copia recién clonada puede utilizar las [cuentas DEMO públicas](./README.es.md#cuentas-de-demostración). El script `database/local/00_setup_local_database.sql` se ejecuta manualmente en instalaciones sin Docker.

Reutilizar un volumen de MySQL inicializado omite los scripts. Editar o añadir un script no actualiza ese volumen. Aplica de forma explícita los cambios necesarios al esquema o a los datos existentes.

| Datos | Volumen DEV | Volumen PROD local |
| --- | --- | --- |
| MySQL | `helpdesk-dev_mysql_data` | `helpdesk-prod_mysql_data` |
| MongoDB | `helpdesk-dev_mongo_data` | `helpdesk-prod_mongo_data` |

MySQL guarda usuarios, catálogos, tickets, comentarios, historial, hashes de los tokens de renovación y metadatos de archivos. MongoDB guarda el contenido binario de los adjuntos y avatares mediante GridFS. Detener o recrear los servicios conserva estos datos en los volúmenes existentes. Los volúmenes separados permiten trabajar en DEV y validar PROD local con datos independientes.

> **Advertencia.** `docker compose down -v` puede eliminar los volúmenes con nombre y los datos persistentes del proyecto seleccionado. Para una parada habitual, utiliza `stop` o `down` sin `-v`.

Los volúmenes proporcionan persistencia. Haz copias de seguridad independientes y coordina la restauración de MySQL y MongoDB para conservar tanto las referencias SQL como el contenido de los archivos. [Documentación de la base de datos](./database/README.es.md)

## 7. Solución de problemas

Empieza por [consultar el estado y los logs del entorno](#consultar-el-estado-y-los-logs). Revisa la salida localmente y oculta cualquier valor sensible antes de compartirla.

| Problema | Comprobación y solución |
| --- | --- |
| Docker Desktop está cerrado o Docker Engine no responde | Ejecuta `docker info`. Si el cliente no puede contactar con el servidor, inicia Docker Desktop o Docker Engine y espera a que esté disponible. |
| El puerto `3000`, `3001`, `8080` o `8081` ya está en uso | Ejecuta `docker ps` para ver los puertos publicados de los contenedores. Si el puerto lo ocupa otro proceso, identifícalo con las herramientas del sistema y libera el puerto del entorno que vas a usar. |
| Faltan variables de entorno | Ejecuta `config --quiet` con el archivo del entorno correcto y revisa los avisos. Compara los nombres y valores necesarios con la plantilla correspondiente. Las variables de la terminal pueden prevalecer sobre el archivo de entorno. |
| Spring Boot no conecta con MySQL | Comprueba el estado de `mysql` y los logs de `backend` y `mysql`. El backend usa `jdbc:mysql://mysql:3306/helpdesk`. Comprueba que la cuenta de la aplicación y sus permisos correspondan al volumen activo. |
| Spring Boot no conecta con MongoDB | Comprueba el estado y los logs de `mongodb`. El backend usa `mongodb://mongodb:27017/helpdesk_attachments`. En Docker se utilizan los nombres de servicio para la conexión entre contenedores. |
| Una base de datos no supera su comprobación de estado | Consulta `ps -a` y los logs de la base de datos afectada. MySQL ejecuta `SELECT 1` con la cuenta de la aplicación y MongoDB ejecuta un ping. Espera a que finalice la inicialización o resuelve el error que indiquen los logs. El backend depende de que ambas comprobaciones sean satisfactorias. |
| Los cambios Java no se reflejan | Comprueba que estás usando DEV, que Watch está activo y que el archivo editado está en `back-end/src` o es `back-end/pom.xml`. Busca el reinicio y posibles errores de compilación en los logs. Si trabajas en PROD local, reconstruye `backend`. |
| Los cambios del frontend no se reflejan | Comprueba que has abierto el puerto del entorno correcto. En DEV, revisa los logs de `frontend` para detectar errores de compilación con Webpack o dependencias. Si cambió el archivo de bloqueo npm, sigue el procedimiento de dependencias de DEV. En PROD local, reconstruye `frontend`. |
| Los scripts SQL modificados no se vuelven a ejecutar | Comprueba si MySQL está reutilizando un volumen. Aplica el cambio necesario de forma explícita al esquema o a los datos existentes. |
| La contraseña de MySQL no cambia al editar `.env` o `.env.dev` | Los valores de inicialización se aplican cuando se crea la base de datos en un volumen vacío. Usa las credenciales que ya tiene el volumen o rota la contraseña mediante una sesión de administración de MySQL. Después coordina el cambio en el archivo de entorno y recrea los servicios afectados con `up -d`. |

## 8. Seguridad y recordatorios

- Mantén `.env` y `.env.dev` fuera de Git. Contienen contraseñas de las bases de datos y claves de firma JWT. Comparte las plantillas para describir la configuración.
- Genera una clave JWT distinta para cada entorno a partir de al menos 32 bytes aleatorios seguros y codifícala en Base64. Spring Boot la usa para firmar y verificar tokens. [Clave de firma de JWT](./README.es.md#clave-de-firma-de-jwt)
- Mantén el administrador de la aplicación `admin`, su contraseña y `03_seed_admin.sql` en privado. Usa una cuenta MySQL con los permisos necesarios para el backend y reserva la cuenta root de MySQL para administración.
- Usa exclusivamente datos de prueba en la demostración pública. Los archivos de Compose están preparados para uso local. Render y Vercel se configuran aparte con los servicios de datos y los secretos del despliegue cloud.
- DEV y PROD local pueden funcionar a la vez en sus puertos respectivos. Usa perfiles de navegador distintos si necesitas mantener las sesiones de `localhost` separadas.
