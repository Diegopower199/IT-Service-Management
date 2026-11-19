# Docker Workflow — IT Service Management

Guía rápida para construir, ejecutar y gestionar el proyecto Help Desk con Docker.

## 1. Entornos del proyecto

| Recurso         | DEV (desarrollo)             | PROD (versión compilada)     |
| --------------- | ---------------------------- | ---------------------------- |
| Proyecto        | `helpdesk-dev`               | `helpdesk-prod`              |
| Docker Compose  | `docker-compose.dev.yaml`    | `docker-compose.yaml`        |
| Variables       | `.env.dev`                   | `.env`                       |
| Dockerfiles     | `Dockerfile.dev`             | `Dockerfile`                 |
| Imagen backend  | `helpdesk-backend:dev`       | `helpdesk-backend:prod`      |
| Imagen frontend | `helpdesk-frontend:dev`      | `helpdesk-frontend:prod`     |
| Frontend        | http://localhost:3001        | http://localhost:3000        |
| API             | http://localhost:8081/api/v1 | http://localhost:8080/api/v1 |

Ambos entornos tienen cuatro contenedores (frontend, backend, MySQL y MongoDB), redes y volúmenes independientes. Las imágenes oficiales de MySQL y MongoDB se comparten. PROD es un entorno local en modo producción, no un despliegue público.

- **Dockerfile:** define cómo construir una imagen.
- **Docker Compose:** define cómo crear, configurar y conectar los contenedores.
- **Imagen:** aplicación empaquetada; un contenedor es una instancia de ella.
- **Volumen:** almacenamiento persistente que conserva los datos aunque se eliminen los contenedores.

## 2. Crear y arrancar los entornos

**Requisitos:** Docker Desktop iniciado, Docker Compose 2.32 o superior para Watch, puertos 3000, 3001, 8080 y 8081 libres. Configurar `.env.dev` y `.env` en la raíz con las credenciales, secretos JWT válidos en Base64 y las URL correspondientes. No subir estos ficheros a GitHub.

Todos los comandos `docker compose` se ejecutan **desde la raíz del repositorio**.

### DEV — desarrollo

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml config --quiet
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

Abrir http://localhost:3001. Para activar el reinicio y recompilación automática del backend, ejecutar en otra terminal:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

Mantener esta terminal abierta mientras se desarrolla. Next.js actualiza el frontend automáticamente mediante Webpack y polling; Compose Watch reinicia el backend y Maven recompila al detectar cambios.

### PROD — validar una versión compilada

```bash
docker compose config --quiet
docker compose up -d --build
```

Abrir http://localhost:3000. Se utilizan por defecto `docker-compose.yaml` y `.env`.

### ¿Qué hace `up -d --build`?

1. Lee los ficheros de Compose y las variables correspondientes.
2. Construye las imágenes del frontend y backend con sus Dockerfile (reutiliza la caché si procede) y obtiene las imágenes oficiales si hacen falta.
3. Crea la red, los volúmenes y los contenedores que falten, o reutiliza los existentes.
4. Arranca las bases de datos, espera sus healthchecks e inicia las aplicaciones según sus dependencias. Los scripts SQL se ejecutan automáticamente al inicializar MySQL por primera vez.

No es necesario ejecutar `docker build` individualmente para cada aplicación.

## 3. Comandos más importantes

### Docker — consultar recursos

| Comando             | Significado                                              |
| ------------------- | -------------------------------------------------------- |
| `docker images`     | Mostrar las imágenes y sus etiquetas.                    |
| `docker ps`         | Mostrar los contenedores en ejecución.                   |
| `docker ps -a`      | Mostrar todos los contenedores, incluidos los detenidos. |
| `docker volume ls`  | Mostrar los volúmenes.                                   |
| `docker network ls` | Mostrar las redes.                                       |
| `docker compose ls` | Mostrar los proyectos Compose activos.                   |

### Docker — construir una imagen manualmente

Por ejemplo, desde la carpeta `back-end`:

```bash
docker build -t helpdesk-backend:prod .
docker build -f Dockerfile.dev -t helpdesk-backend:dev .
```

`-t` asigna nombre y etiqueta, `-f` selecciona un Dockerfile y `.` indica que el contexto de construcción es el directorio actual. Estos comandos crean imágenes, no contenedores.

### Docker Compose — gestionar los servicios

| Operación                 | Significado                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `config --quiet`          | Validar la configuración sin mostrarla.                                              |
| `build`                   | Construir imágenes sin arrancar contenedores.                                        |
| `up -d`                   | Crear o arrancar contenedores sin solicitar una reconstrucción.                      |
| `up -d --build`           | Construir imágenes y arrancar o actualizar contenedores.                             |
| `start`                   | Arrancar contenedores existentes que están detenidos.                                |
| `stop`                    | Detener contenedores sin eliminarlos.                                                |
| `restart backend`         | Reiniciar el backend existente, sin reconstruir ni aplicar cambios de configuración. |
| `down`                    | Eliminar contenedores y red del proyecto; conservar imágenes y volúmenes.            |
| `down -v`                 | Eliminar también los volúmenes declarados y los datos almacenados.                   |
| `ps -a`                   | Consultar el estado de los contenedores del proyecto.                                |
| `logs --tail=100 backend` | Mostrar las últimas 100 líneas del backend.                                          |
| `logs -f frontend`        | Seguir los logs del frontend en tiempo real.                                         |
| `watch --no-up backend`   | Monitorizar el código del backend sin volver a levantar los servicios.               |

Para utilizar estas operaciones, anteponer `docker compose --env-file .env.dev -f docker-compose.dev.yaml` en DEV, o `docker compose` en PROD.

| Parámetro                    | Significado                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `--env-file .env.dev`        | Seleccionar el fichero de variables de desarrollo.                     |
| `-f docker-compose.dev.yaml` | Seleccionar el Compose de desarrollo.                                  |
| `-d`                         | Ejecutar en segundo plano (detached).                                  |
| `--build`                    | Construir las imágenes antes de arrancar.                              |
| `--no-deps`                  | Actuar solo sobre el servicio indicado, sin arrancar sus dependencias. |
| `--force-recreate`           | Forzar la recreación del contenedor.                                   |
| `-v` (con `down`)            | Eliminar los volúmenes asociados.                                      |

## 4. Flujo de trabajo habitual

### Empezar a desarrollar

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d
```

En otra terminal, activar Watch:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

Editar el código desde el IDE y probar en `localhost:3001`. No hace falta reconstruir imágenes por cada cambio de código en DEV.

### Actualizar PROD con los últimos cambios

```bash
docker compose up -d --build
```

Para actualizar únicamente un servicio, si sus dependencias ya están funcionando:

```bash
docker compose up -d --build --no-deps backend
docker compose up -d --build --no-deps frontend
```

### Consultar el estado y los logs de DEV

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml ps -a
docker compose --env-file .env.dev -f docker-compose.dev.yaml logs --tail=100 backend
```

Para PROD, usar `docker compose ps -a` y `docker compose logs --tail=100 backend`.

### Terminar de trabajar

Detener Watch con `Ctrl+C` y parar los entornos que ya no se necesiten:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml stop
docker compose stop
```

Si se quieren eliminar los contenedores, utilizar `down` en lugar de `stop`. **No utilizar `down -v` salvo que se quiera borrar también la información de las bases de datos.**

## 5. ¿Cuándo reconstruir una imagen?

| Cambio                    | DEV                                                  | PROD                  |
| ------------------------- | ---------------------------------------------------- | --------------------- |
| Código React              | Guardar y comprobar el navegador.                    | Reconstruir frontend. |
| Código Java               | Guardar con Watch activo.                            | Reconstruir backend.  |
| Dockerfile                | Reconstruir el servicio correspondiente.             | Igual.                |
| Variables del backend     | Recrear el contenedor con `up -d`.                   | Igual.                |
| Variables `NEXT_PUBLIC_*` | Recrear frontend.                                    | Reconstruir frontend. |
| Dependencias npm          | Actualizar el volumen de `node_modules` y reiniciar. | Reconstruir frontend. |
| Scripts SQL               | Aplicar una migración si el volumen ya existe.       | Igual.                |

Si cambian las dependencias npm en DEV, ejecutar desde la raíz:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml stop frontend
docker compose --env-file .env.dev -f docker-compose.dev.yaml run --rm --no-deps frontend npm ci
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build frontend
```

## 6. Recordatorios

- Dentro de Docker, el backend utiliza `mysql:3306` y `mongodb:27017`, no `localhost`. Las peticiones del navegador utilizan los puertos publicados.
- Las variables de la terminal pueden tener prioridad sobre el `.env`; comprobarlas si hay errores de conexión. No utilizar `root` como `MYSQL_USER`.
- DEV y PROD pueden funcionar simultáneamente. Usar perfiles de navegador distintos para evitar compartir cookies de `localhost`.
- Los volúmenes conservan los datos, pero no sustituyen las copias de seguridad.
