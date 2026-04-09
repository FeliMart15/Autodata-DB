# 📋 GUÍA DE SCRIPTS SQL

Esta carpeta contiene todos los scripts SQL necesarios para el sistema Autodata.

## 📁 Estructura

### Scripts Principales (Orden de Ejecución)

1. **00_validar_estructura.sql** - Valida que la base de datos existe y está configurada correctamente
2. **03_crear_tablas_completas.sql** - Crea todas las tablas principales del sistema
3. **02_seed_estados.sql** - Inserta los estados iniciales del flujo de trabajo
4. **04_seed_usuario_admin.sql** - Crea el usuario administrador inicial
5. **01_crear_vista_modelo_detalle.sql** - Crea vistas para consultas complejas

### Scripts de Configuración Adicionales

- **05_agregar_columna_activo.sql** - Agrega columna "Activo" a tablas si no existe
- **06_actualizar_modelo_nuevo_flujo.sql** - Actualiza estructura para nuevo flujo de estados
- **07_recrear_equipamiento_modelo.sql** - Recrea tabla de equipamiento con todas las columnas
- **08_reestructurar_modelos_19_campos.sql** - 🆕 Reestructura tabla Modelo a 19 campos esenciales (Eliminates Modelo1, renombra Tipo2_Carroceria a Carroceria)
- **09_recrear_equipamiento_campos_especificos.sql** - 🆕 Recrea tabla EquipamientoModelo con campos específicos solicitados

### Scripts de Datos

- **seed-usuarios.sql** - Inserta usuarios de prueba
- **add-codigo-autodata.sql** - Agrega códigos Autodata a modelos existentes

### Scripts de Usuario (Archivos JS)

- **create-users-hash.js** - Genera hashes bcrypt para passwords de usuarios
- **create-usuario-table.sql** - Script alternativo para crear tabla de usuarios

### 🛠️ Utilidades (`utils/`)

Carpeta con scripts de mantenimiento y corrección:

- **fixes_consolidados.sql** - Consolidación de todos los scripts de corrección
  - Verifica y agrega columnas de auditoría
  - Configura tablas de estado
  - Verifica estructura completa
  
- **staging_setup.sql** - Configuración de tabla staging para importación masiva CSV

## 🚀 Orden de Ejecución Recomendado

### Primera Vez (Instalación)
```sql
-- 1. Validar
EXEC sp_executesql '00_validar_estructura.sql'

-- 2. Crear estructura
EXEC sp_executesql '03_crear_tablas_completas.sql'

-- 3. Datos iniciales
EXEC sp_executesql '02_seed_estados.sql'
EXEC sp_executesql '04_seed_usuario_admin.sql'

-- 4. Configuraciones opcionales
EXEC sp_executesql '01_crear_vista_modelo_detalle.sql'
EXEC sp_executesql 'utils/staging_setup.sql' -- Si usarás importación masiva
```

### Correcciones y Actualizaciones
```sql
-- Aplicar fixes si hay problemas
EXEC sp_executesql 'utils/fixes_consolidados.sql'

-- Actualizaciones específicas
EXEC sp_executesql '05_agregar_columna_activo.sql'
EXEC sp_executesql '06_actualizar_modelo_nuevo_flujo.sql'
EXEC sp_executesql '07_recrear_equipamiento_modelo.sql'
```

## 📝 Notas Importantes

- Siempre ejecuta los scripts en orden
- Revisa los mensajes de salida para detectar errores
- Los scripts son idempotentes (pueden ejecutarse múltiples veces)
- Mantén backups antes de ejecutar scripts de actualización

## ⚠️ Scripts Obsoletos Eliminados

Los siguientes scripts fueron consolidados en `utils/fixes_consolidados.sql`:
- ❌ fix_fecha_modificacion.sql
- ❌ fix_modelo_estado_historial.sql
- ❌ verificar_tablas_existentes.sql
- ❌ create-staging-table.sql (movido a utils/staging_setup.sql)
