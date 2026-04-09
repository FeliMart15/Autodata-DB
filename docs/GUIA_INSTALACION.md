# 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN

**Sistema Autodata - Versión Optimizada**  
Última actualización: 20 de Enero, 2026

---

## 📋 PRE-REQUISITOS

### Software Necesario
- **Node.js** v18+ ([Descargar](https://nodejs.org/))
- **SQL Server Express** ([Descargar](https://www.microsoft.com/sql-server/sql-server-downloads))
- **ODBC Driver 17 for SQL Server** ([Descargar](https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server))
- **Git** (opcional, para clonar el repositorio)

### Conocimientos Requeridos
- Básicos de Node.js y npm
- Básicos de SQL Server
- Básicos de React (para frontend)

---

## 🔧 INSTALACIÓN

### 1. Clonar o Descargar el Proyecto

```bash
git clone <url-del-repositorio>
cd Base-De-Datos-Autodata
```

### 2. Instalar Dependencias

#### Backend
```bash
# En la raíz del proyecto
npm install
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

### 3. Configurar SQL Server

#### Verificar SQL Server
```powershell
# Abrir services.msc y verificar que SQL Server (SQLEXPRESS) esté corriendo
# O desde PowerShell:
Get-Service MSSQLSERVER, MSSQL*
```

#### Crear Base de Datos
```sql
-- Abrir SQL Server Management Studio (SSMS)
-- Conectar a localhost\SQLEXPRESS con Windows Authentication
-- Ejecutar:
CREATE DATABASE Autodata;
GO
```

### 4. Ejecutar Scripts SQL (En Orden)

#### Scripts Principales
```sql
-- En SSMS, conectado a la base Autodata
-- Ejecutar en este orden:

-- 1. Validar estructura
:r C:\ruta\sql\00_validar_estructura.sql
GO

-- 2. Crear tablas
:r C:\ruta\sql\03_crear_tablas_completas.sql
GO

-- 3. Insertar estados
:r C:\ruta\sql\02_seed_estados.sql
GO

-- 4. Crear usuario admin
:r C:\ruta\sql\04_seed_usuario_admin.sql
GO

-- 5. Crear vista (opcional)
:r C:\ruta\sql\01_crear_vista_modelo_detalle.sql
GO
```

**Usuario Admin por defecto:**
- Username: `admin`
- Password: `admin123` (cambiar en producción)

#### Scripts Opcionales
```sql
-- Solo si necesitas importación masiva
:r C:\ruta\sql\utils\staging_setup.sql
GO

-- Solo si necesitas correcciones
:r C:\ruta\sql\utils\fixes_consolidados.sql
GO
```

### 5. Configurar Variables de Entorno

#### Backend (.env en raíz)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos (Windows Authentication - No necesita user/password)
DB_SERVER=localhost\\SQLEXPRESS
DB_DATABASE=Autodata

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-cambiala-en-produccion
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env en /frontend)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ▶️ EJECUCIÓN

### Desarrollo

#### Opción 1: Terminales Separadas (Recomendado)

**Terminal 1 - Backend:**
```bash
npm run dev
```
Servidor corriendo en: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Aplicación corriendo en: http://localhost:5173

#### Opción 2: Script Combinado (Si configuras concurrently)
```bash
# Agregar script a package.json raíz:
"dev:all": "concurrently \"npm run dev\" \"cd frontend && npm run dev\""

npm run dev:all
```

### Producción

#### Backend
```bash
# Usar PM2 u otro process manager
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Servir carpeta dist/ con nginx, apache, o similar
```

---

## ✅ VERIFICACIÓN

### 1. Backend Funcionando
```bash
# Hacer petición de prueba
curl http://localhost:3000/api/marcas

# O en PowerShell:
Invoke-WebRequest -Uri "http://localhost:3000/api/marcas" -Method GET
```

Deberías ver una respuesta JSON (puede ser un array vacío).

### 2. Frontend Funcionando
- Abrir http://localhost:5173
- Deberías ver la pantalla de login
- Credenciales: `admin` / `admin123`

### 3. Base de Datos Conectada
- El backend debería mostrar en consola:
  ```
  ✓ Conexión a SQL Server exitosa
  🚀 Servidor corriendo en puerto 3000
  ```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module msnodesqlv8"
```bash
# Reinstalar dependencias
npm install
```

### Error: "Login failed for user"
- Verificar que SQL Server esté usando Windows Authentication
- Verificar que tu usuario Windows tenga permisos en SQL Server

### Error: "ECONNREFUSED" en Frontend
- Verificar que el backend esté corriendo en puerto 3000
- Verificar variable `VITE_API_URL` en frontend/.env

### Error: "Table does not exist"
- Ejecutar scripts SQL en el orden correcto
- Verificar con SSMS que las tablas existan

### Puerto 3000 o 5173 ocupado
```bash
# Cambiar puerto en .env
PORT=3001  # backend

# O matar proceso:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Base-De-Datos-Autodata/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes UI
│   │   ├── pages/        # Páginas/Vistas
│   │   ├── services/     # API clients
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── src/                  # Backend Node.js
│   ├── controllers/      # Lógica de negocio
│   ├── routes/           # Definición de rutas
│   ├── middleware/       # Auth, validaciones
│   ├── config/           # Configuración (DB, logger)
│   └── utils/            # Utilidades
├── sql/                  # Scripts SQL
│   ├── 00-07_*.sql      # Scripts principales
│   └── utils/            # Utilidades SQL
├── logs/                 # Logs del sistema (gitignored)
├── package.json          # Backend dependencies
├── .env                  # Variables de entorno (gitignored)
└── README.md
```

---

## 🔐 SEGURIDAD

### Cambios Necesarios para Producción

1. **Cambiar JWT_SECRET** en .env
   ```bash
   # Generar secreto seguro:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Cambiar password de admin**
   ```sql
   -- En SSMS:
   UPDATE Usuario 
   SET Password = '$2b$10$...'  -- Usar bcrypt para generar hash
   WHERE Username = 'admin';
   ```

3. **Configurar CORS** correctamente
   ```env
   CORS_ORIGIN=https://tu-dominio.com
   ```

4. **Usar HTTPS** en producción

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **[RESUMEN_OPTIMIZACION.md](RESUMEN_OPTIMIZACION.md)** - Cambios recientes
- **[PLAN_MEJORAS_FUTURAS.md](PLAN_MEJORAS_FUTURAS.md)** - Roadmap de desarrollo
- **[sql/README.md](sql/README.md)** - Guía de scripts SQL
- **[PLAN_DESARROLLO.md](PLAN_DESARROLLO.md)** - Plan original de desarrollo

---

## 🆘 SOPORTE

Si encuentras problemas:
1. Revisar sección "Solución de Problemas" arriba
2. Verificar logs en `logs/combined.log`
3. Revisar consola del navegador (F12)
4. Verificar que todos los pre-requisitos estén instalados

---

**¡Todo listo para desarrollar! 🚀**

Siguiente paso: Revisar [PLAN_MEJORAS_FUTURAS.md](PLAN_MEJORAS_FUTURAS.md) para continuar el desarrollo.
