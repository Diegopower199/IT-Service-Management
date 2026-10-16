# Git Workflow

Este documento resume el flujo de trabajo con Git y GitHub utilizado en el proyecto.

El objetivo es mantener `main` estable y desarrollar cada cambio importante en una rama independiente.

---

## 1. Actualizar `main`

Antes de empezar una nueva funcionalidad:

```bash
git switch main
git pull origin main
```

---

## 2. Crear una rama

Crear una rama según el tipo de cambio.

### Nueva funcionalidad

```bash
git switch -c feature/usuarios
```

### Corrección de errores

```bash
git switch -c fix/login-error
```

### Tests

```bash
git switch -c test/auth-service
```

### Refactorización

```bash
git switch -c refactor/user-service
```

### Convención de ramas

```text
feature/nombre
fix/nombre
test/nombre
refactor/nombre
```

Ejemplos:

```text
feature/autenticacion-jwt
feature/tickets
fix/user-validation
test/auth-service
refactor/user-service
```

---

## 3. Guardar los cambios

Cuando tengas cambios listos:

```bash
git add .
git commit -m "feat: implementar CRUD de usuarios"
```

Puedes realizar varios commits durante el desarrollo.

### Convención de commits

```text
feat: nueva funcionalidad
fix: corrección de errores
test: añadir o modificar tests
refactor: cambios internos sin modificar funcionalidad
docs: cambios en documentación
chore: mantenimiento o configuración
```

Ejemplos:

```text
feat: implementar autenticación JWT
fix: corregir validación de usuario
test: añadir tests de AuthService
refactor: simplificar UserService
docs: actualizar documentación
```

---

## 4. Subir la rama a GitHub

La primera vez:

```bash
git push -u origin feature/usuarios
```

Después será suficiente con:

```bash
git push
```

Subir la rama no modifica `main`.

---

## 5. Actualizar la rama antes del Pull Request

Si `main` ha cambiado mientras estabas trabajando:

```bash
git switch main
git pull origin main

git switch feature/usuarios
git merge main
```

Si aparecen conflictos, hay que resolverlos antes de continuar.

Después:

```bash
git add .
git commit
git push
```

---

## 6. Crear el Pull Request

Cuando la funcionalidad esté terminada:

1. Ejecutar:

```bash
git push
```

2. Entrar en GitHub.
3. Crear un Pull Request.
4. Comprobar:

```text
base: main
compare: feature/usuarios
```

5. Revisar los cambios.
6. Hacer **Merge pull request** cuando todo funcione correctamente.

---

## 7. Limpiar la rama

Después del merge:

```bash
git switch main
git pull origin main
git branch -d feature/usuarios
```

También puedes eliminar la rama remota desde GitHub.

---

# Flujo habitual

```text
main
 ↓
crear rama
 ↓
desarrollar
 ↓
commits
 ↓
push
 ↓
Pull Request
 ↓
merge
 ↓
main
```

---

# Reglas del proyecto

- No trabajar directamente sobre `main`.
- `main` debe contener código estable.
- Crear una rama para cada cambio importante.
- Hacer commits pequeños y descriptivos.
- Crear un Pull Request antes de integrar cambios en `main`.
- Antes del merge, comprobar que el proyecto compila y que los tests pasan.

---

# Resumen rápido

```bash
# Actualizar main
git switch main
git pull origin main

# Crear rama
git switch -c feature/nombre

# Trabajar y guardar cambios
git add .
git commit -m "feat: descripción del cambio"

# Subir rama
git push -u origin feature/nombre

# Crear Pull Request y hacer merge en GitHub

# Volver a main y limpiar
git switch main
git pull origin main
git branch -d feature/nombre
```
