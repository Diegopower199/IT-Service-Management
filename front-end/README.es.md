# Help Desk — Frontend

[English](./README.md) | **Español**

Frontend de una aplicación full stack de **gestión de servicios de TI (ITSM) / mesa de ayuda**. Está desarrollado con Next.js y React y ofrece gestión de tickets según el rol, pantallas de administración y un panel conectado a la API REST de Spring Boot.

## Tecnologías

Las versiones indicadas a continuación son las que resuelve `package-lock.json`.

- **Next.js 16.4.2** (App Router), **React 19.3.0**, **TypeScript 5.9.3**
- **Material UI (MUI) 9.5.0** y **MUI X Data Grid 9.16.0**
- **Axios 1.20.0** para la comunicación con la API REST
- **next-intl 4.14.9** para las traducciones en inglés y español
- **Vitest 5.1.0**, **React Testing Library 16.3.3** y **ESLint 9.39.5**

## Funcionalidades

- Inicio y cierre de sesión, gestión de la sesión y renovación automática del token de acceso JWT.
- Navegación adaptada a los roles **ADMIN**, **TECHNICIAN** y **USER**.
- Creación, edición y asignación de tickets, cambios de prioridad y transiciones de estado.
- Listados de tickets con paginación, ordenación y filtros en el servidor.
- Detalle de tickets, comentarios públicos e internos e historial de cambios.
- Subida, vista previa y descarga de adjuntos de tickets y comentarios (PDF, JPEG, PNG, hasta 10 MiB por archivo).
- Subida, sustitución y eliminación del avatar de usuario (JPEG, PNG, hasta 5 MiB), con sincronización entre el perfil y la cabecera.
- Estadísticas y tickets recientes en el panel.
- Administración de usuarios, departamentos, categorías, prioridades y estados.
- Edición del perfil y cambio de contraseña.
- Interfaz en inglés y español con selector de idioma.

## Estructura del proyecto

```text
front-end/
├── src/
│   ├── app/
│   │   ├── modules/       # Feature components and API services
│   │   ├── dashboard/     # Dashboard page
│   │   ├── tickets/       # Tickets, comments and history pages
│   │   ├── users/         # User administration
│   │   ├── profile/       # User profile
│   │   └── .../           # Login, catalogues and error pages
│   ├── components/ui/     # Reusable UI elements
│   ├── config/            # Axios and API configuration
│   ├── context/           # Authentication state
│   ├── hooks/             # Shared hooks
│   ├── i18n/              # Locale configuration
│   ├── layouts/           # Application layout and navigation
│   ├── styles/            # Shared styles and design tokens
│   ├── types/             # TypeScript interfaces and types
│   └── utils/             # Shared utilities
├── messages/
│   ├── en/                # English translations
│   └── es/                # Spanish translations
└── tests/                 # Service, component and Axios tests
```

Next.js utiliza `page.tsx` y `layout.tsx` dentro de `src/app/` para definir las rutas y la interfaz compartida. Las páginas de cada ruta combinan el layout y los componentes del módulo correspondiente. Por ejemplo, la página `src/app/tickets/[id]/page.tsx` pasa el identificador de la ruta a `TicketDetailsContent`. El módulo correspondiente en `src/app/modules/tickets/` se encarga de la pantalla, las interacciones del cliente y las llamadas a la API.

El layout raíz envuelve la aplicación con `NextIntlClientProvider` y `AuthProvider`. `AppLayout` coloca la cabecera y el menú lateral alrededor del contenido de cada módulo. Los componentes, hooks, tipos y utilidades compartidos sirven de base a los módulos de la aplicación.

## Requisitos

- **Node.js 22.22.2+** (u otra versión compatible con las dependencias instaladas)
- **npm**
- Un backend de Spring Boot en ejecución, conectado a la base de datos MySQL ya inicializada y a MongoDB GridFS

Para configurar el backend y la base de datos, consulta el [README del backend](../back-end/README.es.md) y el [README de la base de datos](../database/README.md).

## Ejecutar con Docker

Docker Compose inicia el frontend junto con Spring Boot, MySQL y MongoDB. Sigue el [README principal](../README.es.md) para configurar `.env` o `.env.dev` en la raíz del repositorio.

Ejecuta estos comandos desde la raíz del repositorio.

```bash
# Compiled environment
docker compose up -d --build

# Live development
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

|                      | DEV                                       | PROD (compilación local)       |
| -------------------- | ----------------------------------------- | ------------------------------ |
| URL del frontend     | `http://localhost:3001`                   | `http://localhost:3000`        |
| API del backend      | `http://localhost:8081/api/v1`            | `http://localhost:8080/api/v1` |
| Dockerfile           | `Dockerfile.dev`                          | `Dockerfile`                   |
| Cambios en el código | Montaje bind, Webpack y sondeo de cambios | Reconstruir la imagen          |

La imagen de producción utiliza una compilación de Node.js en varias etapas y la salida standalone de Next.js. En ejecución, inicia `node server.js` e incluye `public/` y `.next/static/`. En DEV, Compose ejecuta `npm run dev -- --webpack` con el sondeo de cambios habilitado. Ambos entornos reciben la configuración de la API desde Compose.

Consulta el [flujo de trabajo con Docker](../DOCKER-WORKFLOW.md) para conocer el proceso de desarrollo y los comandos para actualizar dependencias.

## Puesta en marcha (sin Docker)

Realiza estos pasos desde `front-end/`.

**1. Instalar las dependencias**

```bash
npm ci
```

**2. Configurar las variables de entorno**

Crea `.env` a partir de `.env.sample` con PowerShell o con una terminal de Linux o macOS.

```powershell
# Windows PowerShell
Copy-Item .env.sample .env
```

```bash
# Linux / macOS
cp .env.sample .env
```

Configura las [variables de la API local](#en-local-y-con-docker) en `.env`.

```dotenv
NEXT_PUBLIC_WEB_SERVER=localhost
NEXT_PUBLIC_WEB_PORT_BACK_END=8080
```

Con esta configuración, la URL base de la API es `http://localhost:8080/api/v1`. Deja `NEXT_PUBLIC_API_BASE_URL` sin definir para esta instalación local.

**3. Iniciar el servidor de desarrollo**

```bash
npm run dev
```

Abre **http://localhost:3000**. Asegúrate de que el backend está en ejecución y de que su configuración de CORS permite el origen del frontend.

## Variables de entorno

### En local y con Docker

| Variable                        | Finalidad                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_WEB_SERVER`        | Nombre del host del backend desde el navegador. Los ejemplos locales utilizan `localhost`.                         |
| `NEXT_PUBLIC_WEB_PORT_BACK_END` | Puerto publicado de Spring Boot. Usa `8080` para la instalación manual y PROD local, o `8081` para DEV con Docker. |

`src/config/env.ts` construye la URL base con el formato `http://<host>:<port>/api/v1`. Con Docker, el navegador usa el puerto publicado en la máquina anfitriona. En PROD, ambos valores se pasan desde `.env` como argumentos de compilación del frontend. En DEV, las variables `DEV_NEXT_PUBLIC_WEB_SERVER` y `DEV_NEXT_PUBLIC_WEB_PORT_BACK_END` de `.env.dev` se pasan al contenedor del frontend. Si cambias variables públicas de una compilación de producción, debes reconstruir la imagen del frontend.

### Despliegue en Vercel

| Variable                   | Finalidad                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Configúrala como `/api/v1` para que el navegador envíe las peticiones al origen del frontend en Vercel. Este valor tiene prioridad sobre las variables de la API local. |
| `BACKEND_PROXY_URL`        | Configuración de Next.js en el servidor que indica el origen de Spring Boot en Render.                                                                                  |

Cuando se define `BACKEND_PROXY_URL`, `next.config.ts` reescribe las peticiones a `/api/v1/:path*` para enviarlas a la misma ruta en el backend de Render. Mantén `BACKEND_PROXY_URL` en el entorno del servidor y sin el prefijo `NEXT_PUBLIC_`. Las variables públicas quedan expuestas al navegador y solo deben contener valores públicos. Consulta la [arquitectura en la nube del README principal](../README.es.md#arquitectura-en-la-nube).

## Autenticación

`AuthProvider` expone el usuario actual, el token de acceso, el estado de autenticación y la acción de cierre de sesión a través de `AuthContext`. Los componentes leen este estado con `useAuth()`. El indicador `isAuthReady` señala a las pantallas protegidas que la restauración de la sesión ha terminado.

1. **Iniciar sesión.** `LoginForm` llama a `POST /api/v1/auth/login`. Si la petición tiene éxito, `AuthProvider` guarda el token de acceso, el identificador de usuario, el nombre de usuario y el rol en el estado de React y en `localStorage`. Después, el formulario redirige a `/dashboard`.
2. **Restaurar la sesión.** Al montarse, `AuthProvider` restaura la sesión si están presentes las cuatro claves de `localStorage` (`token`, `userId`, `username` y `role`). Después establece `isAuthReady`. Las pantallas protegidas esperan a que termine la restauración y redirigen a `/login` a quienes no tienen sesión. Las pantallas de administración redirigen a `/403` a los usuarios con otros roles.
3. **Enviar las credenciales.** La instancia compartida de Axios añade `Authorization: Bearer <access-token>` a las peticiones protegidas. Usa `withCredentials: true` para que el navegador pueda gestionar la rotación de la cookie de renovación `HttpOnly` que emite Spring Boot.
4. **Renovar la sesión.** Ante una respuesta `401` que cumpla las condiciones para renovar la sesión, el interceptor de respuestas llama a `POST /api/v1/auth/refresh`. Si coinciden varios fallos, las peticiones comparten una única promesa de renovación en curso en la instancia actual del cliente. Si la renovación tiene éxito, `AuthProvider` guarda el nuevo token de acceso y Axios reintenta una vez cada petición que cumple las condiciones. La lógica de renovación omite los endpoints de autenticación y las peticiones fallidas que ya se han reintentado. Si la renovación falla, el proveedor borra el estado local de autenticación y redirige a `/login`.
5. **Cerrar sesión.** La cabecera llama a `signOut()`, que envía `POST /api/v1/auth/logout` para que Spring Boot pueda revocar el token de renovación y borrar su cookie. El proveedor borra el estado local de autenticación y redirige a `/login` aunque falle la petición.

## Roles y cuentas de demostración

El menú lateral y las pantallas de tickets adaptan la navegación y las acciones al rol del usuario autenticado. Spring Boot aplica las reglas de autorización a cada petición a la API, incluido el acceso a tickets y archivos concretos.

| Rol          | Interfaz                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------- |
| `ADMIN`      | Panel, tickets, perfil, administración de usuarios y catálogos, y catálogo de roles.         |
| `TECHNICIAN` | Panel, listado de tickets asignados, perfil y acciones sobre tickets según los permisos.     |
| `USER`       | Panel, tickets que ha creado o que se han solicitado para él, comentarios públicos y perfil. |

- `admin_demo` puede gestionar cuentas `USER` y `TECHNICIAN` no protegidas. Para `admin_demo`, la interfaz de usuarios muestra las cuentas `admin`, `admin_demo`, `technician_demo` y `user_demo` en modo de solo lectura e impide conceder el rol `ADMIN`.
- `technician_demo` y `user_demo` conservan las funciones de tickets y del panel correspondientes a sus roles.
- Las tres cuentas de demostración tienen los datos personales en modo de solo lectura y el cambio de contraseña deshabilitado. Cada una puede subir, reemplazar y eliminar su propio avatar. Consulta las [cuentas públicas de demostración del README principal](../README.es.md#cuentas-de-demostración).

## Internacionalización

`next.config.ts` registra `src/i18n/request.ts` mediante el plugin de `next-intl`. La configuración de cada petición lee la cookie `locale`, acepta `en` o `es` y usa `en` por defecto. `messages/index.ts` agrupa los archivos JSON de cada idioma en espacios de nombres como `Auth`, `Navigation` y `Tickets`. El `NextIntlClientProvider` raíz proporciona estos mensajes a los componentes de cliente.

El selector de idioma guarda la cookie `locale` para todo el sitio y llama a `router.refresh()` para que Next.js la lea en la siguiente petición. Las URL se mantienen al cambiar de idioma.

Los componentes de cliente usan `useTranslations` con un espacio de nombres. Este ejemplo utiliza la clave `Navigation.Header.logout` de la cabecera.

```tsx
"use client";

import { useTranslations } from "next-intl";

export function LogoutLabel() {
  const t = useTranslations("Navigation.Header");
  return <span>{t("logout")}</span>;
}
```

Para añadir un mensaje, incorpora la misma clave al archivo JSON del módulo correspondiente en `messages/en/` y `messages/es/`. Para un texto de la cabecera, usa el objeto `Header` en cada archivo `navigation.json`. Lee la clave en el componente mediante el espacio de nombres correspondiente.

Para añadir un idioma, crea los archivos JSON de sus módulos, registra el idioma y sus espacios de nombres en `messages/index.ts`, añádelo a `SUPPORTED_LOCALES` en `src/i18n/request.ts` y agrega en `LanguageSelector` una opción con su texto o bandera. Actualmente, el documento raíz declara `lang="en"` con independencia del idioma seleccionado. Las pantallas genéricas de acceso denegado, página no encontrada y error inesperado muestran texto en inglés.

## Archivos y avatares

Las operaciones con archivos utilizan servicios de Axios específicos en los módulos correspondientes.

| Servicio                            | Operaciones                                                                                                   | Formatos admitidos | Tamaño máximo por archivo |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------- |
| `ticketAttachmentService.ts`        | Listar, subir, previsualizar y descargar adjuntos de tickets.                                                 | PDF, JPEG, PNG     | 10 MiB                    |
| `ticketCommentAttachmentService.ts` | Listar, subir, previsualizar y descargar adjuntos de comentarios.                                             | PDF, JPEG, PNG     | 10 MiB                    |
| `userAvatarService.ts`              | Consultar un avatar por identificador de usuario y subir, reemplazar o eliminar el avatar del usuario actual. | JPEG, PNG          | 5 MiB                     |

Las subidas envían el archivo en un campo `file` de `FormData`. Los adjuntos de un comentario se seleccionan mientras se redacta y se suben después de crearlo. Las vistas previas y las descargas usan respuestas de tipo `Blob` y URL de objeto. El backend comprueba los permisos y valida los archivos.

Al subir, reemplazar o eliminar un avatar, el perfil actualiza su imagen y emite el evento `user-avatar-updated` para que la cabecera también la actualice. Si la consulta del avatar devuelve `204 No Content`, se muestra el avatar predeterminado. Ambas vistas se actualizan sin recargar la página, también para las tres cuentas de demostración.

## Páginas principales

| Ruta                     | Descripción                             |
| ------------------------ | --------------------------------------- |
| `/`                      | Redirección a `/login`                  |
| `/login`                 | Autenticación de usuarios               |
| `/dashboard`             | Estadísticas y tickets recientes        |
| `/tickets`               | Listado, filtrado y gestión de tickets  |
| `/tickets/[id]`          | Detalle, acciones y adjuntos del ticket |
| `/tickets/[id]/comments` | Conversación del ticket                 |
| `/tickets/[id]/history`  | Historial de actividad del ticket       |
| `/profile`               | Gestión del perfil y de la contraseña   |
| `/users`                 | Administración de usuarios              |
| `/departments`           | Administración de departamentos         |
| `/categories`            | Administración de categorías            |
| `/priorities`            | Administración de prioridades           |
| `/statuses`              | Administración de estados               |
| `/roles`                 | Información sobre roles                 |
| `/403`                   | Acceso denegado                         |

Las páginas de usuarios, departamentos, categorías, prioridades, estados y roles son de administración. Las rutas de tickets comparten un layout que espera a que se resuelva la autenticación y valida el identificador del ticket. Las pantallas de cada módulo gestionan los errores de acceso de la API. `src/app/not-found.tsx` y `src/app/error.tsx` proporcionan las pantallas de página no encontrada y de error inesperado.

## Pruebas y controles de calidad

Ejecuta estos comandos desde `front-end/` con las dependencias instaladas y el entorno de la API configurado.

```bash
npm run lint       # ESLint
npm run test:run   # Run Vitest once
npm run build      # Production build
npm run check      # Lint, tests and build
```

`npm run lint` aplica las reglas configuradas de ESLint, `npm run test:run` ejecuta Vitest una sola vez y `npm run build` genera la compilación de producción. `npm run check` ejecuta los tres comandos en ese orden y se detiene si alguno falla. Usa `npm test` para ejecutar Vitest en modo de observación en una terminal interactiva.

`vitest.config.mts` usa `jsdom` como entorno de pruebas. React Testing Library prueba los componentes renderizados y el archivo de preparación de las pruebas limpia el DOM renderizado después de cada prueba.

- `tests/services/` comprueba las llamadas a la API y sus parámetros para autenticación, tickets, comentarios, historial, usuarios y catálogos mediante llamadas simuladas de Axios.
- `tests/components/` cubre el inicio de sesión, los formularios de tickets y usuarios, los filtros, los diálogos de tickets, los adjuntos de comentarios y el comportamiento del perfil. Los casos de demostración cubren la restricción para seleccionar el rol `ADMIN`, el formulario de contraseña en modo de solo lectura y la subida y eliminación de avatares en el perfil y la cabecera.
- `tests/axios/` cubre las cabeceras Bearer, las cookies de renovación, la renovación compartida ante respuestas `401` simultáneas, los reintentos y la expiración de la sesión.

Las pruebas automatizadas utilizan servicios y respuestas simulados. Comprueba el flujo completo de inicio de sesión, las restricciones por rol, las operaciones con tickets y los flujos de archivos con un backend de Spring Boot en ejecución. Para ejecutar en local el frontend compilado, usa la configuración de Docker con salida standalone descrita arriba, que sirve el `server.js` generado y los archivos estáticos empaquetados.
