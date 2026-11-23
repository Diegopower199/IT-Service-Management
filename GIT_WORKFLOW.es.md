# Flujo de trabajo con Git — Help Desk

[English](./GIT_WORKFLOW.md) | **Español**

Esta guía describe el flujo de trabajo con Git y GitHub de Help Desk. Mantén `main` estable y desarrolla cada cambio importante en una rama independiente.

## 1. Convenciones de ramas

Elige un prefijo que describa el propósito de la rama. Usa un nombre breve y específico después de la barra.

| Prefijo | Cuándo usarlo | Ejemplo de Help Desk |
| --- | --- | --- |
| `feat/` | Nueva funcionalidad. | `feat/demo-account-restrictions` |
| `fix/` | Corrección de un error. | `fix/demo-avatar-deletion` |
| `docs/` | Cambios de documentación. | `docs/project-documentation` |
| `refactor/` | Cambios internos que conservan el comportamiento. | `refactor/database-scripts` |
| `test/` | Pruebas nuevas o actualizadas. | `test/auth-service` |
| `chore/` | Mantenimiento o configuración. | `chore/docker-development-settings` |

El repositorio conserva ramas históricas con el prefijo `feature/`, como `feature/ticket-attachments`. Usa `feat/` para las nuevas funcionalidades y conserva los nombres de las ramas existentes.

## 2. Empezar una tarea

Antes de cambiar de rama o ejecutar `git pull`, consulta `git status`. Si hay cambios pendientes, revísalos primero y guarda el trabajo que corresponda en su rama. Con el árbol de trabajo limpio, sigue la secuencia de abajo. Al cambiar a `main`, comprueba su estado antes del pull y revisa cualquier commit local pendiente. Sustituye el nombre de ejemplo si ya existe una rama con ese nombre.

```bash
git status
git switch main
git pull origin main
git switch -c docs/project-documentation
```

Realiza los cambios en esa rama. Revisa y registra el trabajo en commits antes de publicarlo en GitHub.

## 3. Revisar y registrar los cambios

Revisa el estado y las diferencias antes de preparar archivos. Este ejemplo prepara solo `README.md`. Lee todo el diff preparado antes de ejecutar el último comando.

```bash
git status
git diff
git add README.md
git diff --cached
git commit -m "docs: update project documentation"
```

- `git status` muestra la rama actual y los archivos preparados, sin preparar o nuevos.
- `git diff` muestra los cambios sin preparar de los archivos que Git ya sigue. Para archivos nuevos, revisa su contenido o el diff después de prepararlos.
- `git add README.md` prepara el contenido de ese archivo para el próximo commit.
- `git diff --cached` muestra todos los cambios que entrarían en el commit.
- `git commit -m "docs: update project documentation"` registra los cambios preparados con ese mensaje.

### Conventional Commits

Escribe los mensajes en inglés con un tipo que indique el motivo del cambio y una descripción concreta.

| Tipo | Cuándo usarlo | Ejemplo |
| --- | --- | --- |
| `feat:` | Añadir una funcionalidad. | `feat: restrict demo account permissions` |
| `fix:` | Corregir un comportamiento incorrecto. | `fix: allow demo accounts to delete their own avatars` |
| `docs:` | Cambiar documentación. | `docs: update backend API documentation` |
| `refactor:` | Reorganizar la implementación sin cambiar el comportamiento. | `refactor: organize database initialization scripts` |
| `test:` | Añadir o actualizar pruebas. | `test: add demo account authorization tests` |
| `chore:` | Mantener las herramientas o la configuración del proyecto. | `chore: update Docker development settings` |

Otro ejemplo es `docs: add Spanish translation of frontend README`. Durante el desarrollo puedes hacer varios commits pequeños, cada uno con un propósito concreto.

### Revisar archivos privados antes del commit

Prepara los archivos por nombre. Revisa los nombres y el contenido del diff preparado para descartar archivos `.env` o `.env.dev`, contraseñas, tokens, claves y certificados privados, archivos de credenciales, `database/03_seed_admin.sql` y otros archivos locales. Un secreto puede estar dentro de un archivo de código o documentación que sí debe incluirse.

```bash
git diff --cached --name-only
git check-ignore -v -- .env .env.dev database/03_seed_admin.sql
git ls-files -- .env .env.dev database/03_seed_admin.sql
```

`git diff --cached --name-only` enumera los archivos preparados. `git check-ignore -v` muestra qué regla excluye cada ruta. `git ls-files` permite comprobar si alguna de esas rutas ya está en el índice de Git. Si aparece una, revisa su estado antes de publicar.

`.gitignore` afecta a los archivos que Git todavía no sigue. Un secreto ya versionado puede permanecer en commits anteriores. Si se ha publicado, revócalo o rótalo y coordina su retirada.

## 4. Publicar la rama en GitHub

Comprueba con `git status` que estás en la rama de trabajo. Cuando tengas los commits listos y revisados, publícala y configura su rama remota de seguimiento.

```bash
git push -u origin docs/project-documentation
```

Para publicar nuevos commits de esa rama con el seguimiento ya configurado, utiliza este comando.

```bash
git push
```

El push de la rama de trabajo publica sus commits en GitHub. La integración en `main` llega después, mediante el Pull Request.

## 5. Actualizar la rama y resolver conflictos

Si `main` ha avanzado, revisa el estado y guarda primero el trabajo pendiente. Con el árbol limpio, actualiza tu copia local de `main` y fusiónala en la rama de trabajo.

```bash
git switch main
git pull origin main
git switch docs/project-documentation
git merge main
```

Si Git completa el merge automáticamente, el paso ya ha terminado y no hace falta otro commit. Si hay conflictos, identifica los archivos que siguen sin resolver.

```bash
git status
git diff --name-only --diff-filter=U
```

Revisa las diferencias y las marcas de conflicto de cada archivo. Resuelve el contenido manualmente para mantener los cambios necesarios de ambas ramas y elimina las marcas de conflicto. Prepara solo los archivos que hayas resuelto. En el ejemplo, sustituye `README.md` por cada archivo que corresponda. Cuando `git status` indique que todos los conflictos están resueltos y que el merge sigue en curso, complétalo.

```bash
git add README.md
git diff --cached
git status
git merge --continue
```

Si necesitas cancelar un merge que todavía está en curso, utiliza `git merge --abort`. Git intenta volver al estado anterior al merge. Guarda aparte las resoluciones que quieras conservar antes de abortar. Los cambios que ya estaban sin confirmar al iniciar el merge pueden dificultar la recuperación, por eso conviene empezar con el árbol limpio.

```bash
git merge --abort
```

Cuando termine el merge, vuelve a comprobar las partes afectadas y publica el resultado en la rama de trabajo.

## 6. Abrir y revisar un Pull Request

1. Publica la rama y abre un Pull Request en GitHub. Comprueba que la base sea `main` y que la rama de comparación corresponda a tu tarea.

   ```text
   base: main
   compare: docs/project-documentation
   ```

2. Escribe un título claro. Explica los cambios y su motivo, e indica las pruebas o comprobaciones que ejecutaste con sus resultados.
3. Revisa la pestaña **Files changed**. Comprueba que el diff contiene solo cambios relacionados con la tarea y que no incluye secretos ni archivos privados.
4. Resuelve en la rama de trabajo los conflictos que indique GitHub, repite las comprobaciones afectadas y publica los cambios. Revisa también cualquier observación de la revisión.
5. Fusiona en `main` cuando el diff sea correcto, se hayan revisado los resultados de las comprobaciones y se cumplan los requisitos que GitHub muestre para el Pull Request.

Puedes copiar esta plantilla en la descripción del Pull Request.

```markdown
## Summary
- What changed and why

## Verification
- Commands or manual checks run and their results
- Checks not run, if any

## Review
- [ ] I reviewed the diff and confirmed it contains no secrets or private files.
- [ ] I resolved any merge conflicts and rechecked the affected changes.
```

## 7. Comprobaciones antes de fusionar

Acompaña los cambios funcionales con las pruebas adecuadas para el comportamiento que cambia. En una tarea de documentación, revisa el Markdown, los enlaces y los comandos frente a los archivos y scripts del proyecto.

### Backend

Ejecuta Maven Wrapper desde `back-end/`. En PowerShell usa el comando de Windows.

```powershell
.\mvnw.cmd clean verify
```

En Linux o macOS, concede permiso de ejecución al wrapper si hace falta con `chmod u+x mvnw` y usa este comando.

```bash
./mvnw clean verify
```

`clean verify` limpia los resultados anteriores, compila, ejecuta las pruebas configuradas y recorre el ciclo de Maven hasta la fase de verificación.

### Frontend

Desde `front-end/`, configura las variables de la API que necesita el frontend y ejecuta estos comandos. [Variables de entorno del frontend](./front-end/README.es.md#variables-de-entorno)

```bash
npm ci
npm run check
```

`npm ci` instala las dependencias del archivo de bloqueo. `npm run check` ejecuta ESLint, Vitest una vez y la compilación de producción de Next.js, en ese orden. Si un paso falla, se detiene.

Complementa las pruebas automatizadas con comprobaciones de integración cuando corresponda, por ejemplo al cambiar la autenticación, la conexión a MySQL o el almacenamiento de adjuntos en GridFS. En el Pull Request, indica qué comprobaciones ejecutaste y cuáles quedaron pendientes. Marca una comprobación como superada solo si la ejecutaste y terminó correctamente. [Pruebas y controles de calidad](./README.es.md#pruebas-y-controles-de-calidad)

## 8. Limpiar después del Pull Request

Confirma que el Pull Request está fusionado en `main` y que la rama no contiene trabajo local pendiente. Con el árbol limpio, actualiza `main` y elimina la rama local ya integrada.

```bash
git switch main
git pull origin main
git branch -d docs/project-documentation
```

Si `git branch -d` rechaza la eliminación, revisa el Pull Request y comprueba dónde quedó el trabajo. Una fusión con squash puede integrar los cambios con identificadores de commit distintos. Conserva la rama hasta poder confirmar que todo el trabajo está a salvo.

En GitHub, usa **Delete branch** en el Pull Request fusionado para retirar la rama remota si aún existe. Comprueba que nadie dependa de ella y que otros Pull Requests no la usen como base. Conserva cualquier rama que todavía tenga trabajo pendiente.

## 9. Flujo habitual

```text
main
  ↓
nueva rama
  ↓
desarrollo
  ↓
commits
  ↓
push
  ↓
Pull Request
  ↓
revisión
  ↓
merge
  ↓
main
```

## 10. Buenas prácticas del proyecto

- Mantén `main` estable y usa Pull Requests para integrar cambios de ramas de trabajo.
- Haz commits pequeños y descriptivos. Mantén separados los cambios de funcionalidad, refactorización y documentación que no estén relacionados.
- Revisa el diff completo y excluye los secretos antes de cada publicación.
- Evita reescribir el historial de ramas compartidas con un force push. Si hay un motivo justificado, coordínalo antes con quienes usan la rama.
- Revisa los resultados de las pruebas y las comprobaciones de integración relevantes antes de fusionar.

Estas son convenciones de trabajo del proyecto. Las reglas de ramas y las comprobaciones automáticas de GitHub dependen de la configuración del repositorio. Consulta los requisitos que GitHub muestre y registra por separado las comprobaciones locales.
