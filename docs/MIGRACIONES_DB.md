# Historial de Migraciones - Base de Datos Autodata

## 10_renombrar_tipo2_carroceria.sql
**Fecha:** 23 de Enero, 2026  
**Estado:** ✅ Ejecutada exitosamente

### Descripción
Renombra la columna `Tipo2_Carroceria` a `Carroceria` en la tabla `Modelo` para mantener consistencia con el código y mejorar la legibilidad.

### Cambios realizados
- ✅ Columna `Tipo2_Carroceria` renombrada a `Carroceria`
- ✅ Verificación de estado antes y después de la migración
- ✅ Manejo seguro de casos edge (columna ya existe, etc.)

### Código actualizado
- Backend: `src/middleware/estadoValidation.js`
- Frontend: `frontend/src/components/modelos/FormularioDatosMinimos.tsx`
- Types: `frontend/src/types/index.ts`

### Verificación
```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo' AND COLUMN_NAME = 'Carroceria';
```

### Rollback (si es necesario)
```sql
EXEC sp_rename 'Modelo.Carroceria', 'Tipo2_Carroceria', 'COLUMN';
```

---

## Migraciones Anteriores

### 08_reestructurar_modelos_19_campos.sql
Reestructuración de la tabla Modelo a 19 campos (5 obligatorios + 14 datos mínimos)

### 07_recrear_equipamiento_modelo.sql
Recreación de la tabla de equipamiento con campos específicos

### 06_actualizar_modelo_nuevo_flujo.sql
Actualización del flujo de trabajo con nuevos estados

### 05_agregar_columna_activo.sql
Agregado de columna Activo para soft-delete

### 04_seed_usuario_admin.sql
Creación de usuario administrador inicial

### 03_crear_tablas_completas.sql
Creación de estructura completa de tablas

### 02_seed_estados.sql
Población de tabla de estados del workflow

### 01_crear_vista_modelo_detalle.sql
Creación de vista con detalles completos del modelo
