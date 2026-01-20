# 🚗 Sistema Autodata - Gestión de Modelos de Vehículos

> Sistema completo de gestión de catálogo de vehículos con flujo de estados, control de versiones y auditoría.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Express-red.svg)](https://www.microsoft.com/sql-server/)

---

## 📋 Descripción

Sistema de gestión integral para catálogo de modelos de vehículos, diseñado para:

- ✅ Importar y validar datos de modelos
- ✅ Gestionar flujo de estados (entrada → revisión → aprobación → publicación)
- ✅ Controlar versiones y equipamiento
- ✅ Mantener historial completo de cambios
- ✅ Gestionar precios y ventas
- ✅ Sistema de roles y permisos

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar repositorio
git clone <url>
cd Base-De-Datos-Autodata

# 2. Instalar dependencias
npm install
cd frontend && npm install && cd ..

# 3. Configurar .env (ver GUIA_INSTALACION.md)

# 4. Ejecutar scripts SQL (ver sql/README.md)

# 5. Iniciar desarrollo
npm run dev              # Backend en terminal 1
cd frontend && npm run dev  # Frontend en terminal 2
```

**Usuario por defecto:** `admin` / `admin123`

📖 **Guía completa:** [GUIA_INSTALACION.md](GUIA_INSTALACION.md)

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Node.js + Express
- SQL Server (msnodesqlv8 - Windows Authentication)
- JWT Authentication
- Winston Logger
- Joi Validation

**Frontend:**
- React 18 + TypeScript
- Vite
- TanStack Query (React Query)
- Tailwind CSS + shadcn/ui
- React Router v6

**Base de Datos:**
- SQL Server Express
- Tablas: Usuario, Marca, Modelo, Equipamiento, Precios, Ventas
- Historial completo de cambios

---

## 📁 Estructura del Proyecto

```
Base-De-Datos-Autodata/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas/Vistas principales
│   │   ├── services/     # Servicios API
│   │   ├── context/      # Context API (Auth, Toast)
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
│   └── package.json
├── src/                  # Backend API
│   ├── controllers/      # Controladores de rutas
│   ├── routes/           # Definición de endpoints
│   ├── middleware/       # Auth, validaciones
│   ├── config/           # Configuración (DB, logger)
│   └── utils/            # Utilidades
├── sql/                  # Scripts SQL
│   ├── 00-07_*.sql      # Scripts principales
│   └── utils/            # Scripts consolidados
├── logs/                 # Logs del sistema
└── package.json          # Dependencias backend
```

---

## 🎯 Funcionalidades Principales

### ✅ Implementadas

- **Autenticación JWT** con roles de usuario
- **CRUD completo** de Marcas y Modelos
- **Gestión de Equipamiento** por modelo
- **Control de Precios** (modelo y versión)
- **Importación CSV** de modelos masivos
- **Historial de cambios** completo
- **Sistema de logging** con Winston
- **UI moderna** con Tailwind + shadcn/ui

### 🚧 En Desarrollo

- Flujo completo de estados (pendiente validaciones)
- Sistema de aprobaciones multi-nivel
- Reportes y estadísticas
- Exportación de datos

📖 **Ver roadmap completo:** [PLAN_MEJORAS_FUTURAS.md](PLAN_MEJORAS_FUTURAS.md)

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [GUIA_INSTALACION.md](GUIA_INSTALACION.md) | Guía completa de instalación y configuración |
| [RESUMEN_OPTIMIZACION.md](RESUMEN_OPTIMIZACION.md) | Cambios recientes y optimizaciones aplicadas |
| [PLAN_MEJORAS_FUTURAS.md](PLAN_MEJORAS_FUTURAS.md) | Roadmap y próximos pasos de desarrollo |
| [sql/README.md](sql/README.md) | Guía de scripts SQL y orden de ejecución |
| [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md) | Plan original de desarrollo por fases |

---

## 🔑 Endpoints API Principales

### Autenticación
```
POST   /api/auth/login     # Iniciar sesión
POST   /api/auth/register  # Registrar usuario
GET    /api/auth/me        # Usuario actual
```

### Marcas
```
GET    /api/marcas         # Listar marcas
POST   /api/marcas         # Crear marca
PUT    /api/marcas/:id     # Actualizar marca
DELETE /api/marcas/:id     # Eliminar marca
```

### Modelos
```
GET    /api/modelos        # Listar modelos
GET    /api/modelos/:id    # Detalle de modelo
POST   /api/modelos        # Crear modelo
PUT    /api/modelos/:id    # Actualizar modelo
DELETE /api/modelos/:id    # Eliminar modelo
```

### Equipamiento
```
GET    /api/equipamiento/:modeloId  # Obtener equipamiento
POST   /api/equipamiento             # Crear/Actualizar equipamiento
```

### Precios
```
GET    /api/precios/modelo/:id      # Historial de precios
POST   /api/precios/modelo          # Crear precio modelo
POST   /api/precios/version         # Crear precio versión
```

### Importación
```
POST   /api/import/csv              # Importar CSV
```

---

## 🛠️ Tecnologías y Librerías

### Backend
- **Express** - Framework web
- **msnodesqlv8** - Driver SQL Server con Windows Auth
- **jsonwebtoken** - Autenticación JWT
- **bcrypt** - Hash de contraseñas
- **winston** - Sistema de logs
- **joi** - Validación de datos
- **multer** - Upload de archivos
- **csv-parse** - Parseo de CSV

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TanStack Query** - Data fetching y cache
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Radix UI** - Primitivos accesibles
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Axios** - Cliente HTTP

---

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de inputs con Joi/Zod
- ✅ CORS configurado
- ✅ Variables de entorno para secretos
- ⚠️ Rate limiting (pendiente)
- ⚠️ HTTPS (pendiente - producción)

---

## 📊 Base de Datos

### Tablas Principales
- `Usuario` - Usuarios del sistema
- `Marca` - Catálogo de marcas
- `Modelo` - Modelos de vehículos
- `ModeloEstado` - Historial de cambios de estado
- `EquipamientoModelo` - Equipamiento por modelo
- `VersionModelo` - Versiones/variantes
- `PrecioModelo` - Historial de precios por modelo
- `PrecioVersion` - Historial de precios por versión
- `VentasModelo` - Datos de ventas mensuales

### Flujo de Estados
```
IMPORTADO → DATOS_MINIMOS → REVISION_MINIMOS → MINIMOS_APROBADOS
                ↓
EQUIPAMIENTO_CARGADO → REVISION_EQUIPAMIENTO → APROBADO → PUBLICADO
```

---

## 🧪 Testing

*Pendiente de implementación*

Tecnologías recomendadas:
- **Backend:** Jest / Mocha
- **Frontend:** Vitest + React Testing Library
- **E2E:** Playwright / Cypress

---

## 📈 Performance

### Optimizaciones Aplicadas
- ✅ 4 dependencias eliminadas (-25 MB)
- ✅ Código duplicado eliminado
- ✅ Scripts SQL consolidados
- ✅ Connection pooling en BD

### Pendientes
- [ ] Caching con Redis
- [ ] Code splitting en frontend
- [ ] Lazy loading de componentes
- [ ] Compresión gzip
- [ ] CDN para assets estáticos

---

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Notas de Versión

### v1.0.0 - Optimización (20 Ene 2026)
- ✅ Eliminadas 4 dependencias no utilizadas
- ✅ Removido código duplicado
- ✅ Scripts SQL consolidados
- ✅ Documentación mejorada
- ✅ Estructura de proyecto optimizada

### v0.9.0 - Base Funcional
- ✅ CRUD completo de Marcas y Modelos
- ✅ Sistema de autenticación
- ✅ Frontend React completo
- ✅ Backend API REST
- ✅ Base de datos SQL Server

---

## 📧 Contacto

Para preguntas o soporte, revisar la documentación o crear un issue.

---

## 📄 Licencia

ISC

---

**Estado del Proyecto:** 🟡 En Desarrollo Activo

**Próximos Pasos:** Ver [PLAN_MEJORAS_FUTURAS.md](PLAN_MEJORAS_FUTURAS.md)
