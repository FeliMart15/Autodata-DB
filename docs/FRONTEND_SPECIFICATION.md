# Sistema de Gestión de Datos Automotrices - Frontend

## Especificación Técnica Completa

### 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Diseño UX/UI](#diseño-uxui)
5. [Estructura de Carpetas](#estructura-de-carpetas)
6. [Componentes del Sistema](#componentes-del-sistema)
7. [Páginas y Flujos](#páginas-y-flujos)
8. [Sistema de Roles](#sistema-de-roles)
9. [Estados y Flujo de Trabajo](#estados-y-flujo-de-trabajo)
10. [Patrones de Diseño](#patrones-de-diseño)
11. [Validaciones](#validaciones)
12. [Guía de Implementación](#guía-de-implementación)

---

## 🎯 Visión General

Sistema web interno profesional para la gestión completa del ciclo de vida de información automotriz, desde la importación inicial hasta la aprobación final y mantenimiento de datos definitivos.

### Objetivos

- **Trazabilidad Total**: Registro completo de todos los cambios con auditoría
- **Flujo de Trabajo Estructurado**: 4 etapas con validaciones y aprobaciones
- **Control de Calidad**: Revisiones múltiples por diferentes roles
- **Eficiencia**: Autoguardado, validaciones en tiempo real, importación masiva
- **Usabilidad**: Interfaz moderna, intuitiva y responsive

---

## 🏗️ Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (React + TS)              │
├─────────────────────────────────────────────────┤
│  Presentation Layer                             │
│  ├── Pages (Pantallas principales)             │
│  ├── Components (Reutilizables)                │
│  └── UI Components (Shadcn-inspired)           │
├─────────────────────────────────────────────────┤
│  State Management                               │
│  ├── Context API (Auth, Toast)                 │
│  ├── React Query (Server State)                │
│  └── Local State (useState, useReducer)        │
├─────────────────────────────────────────────────┤
│  Business Logic                                 │
│  ├── Services (API calls)                      │
│  ├── Hooks (Custom logic)                      │
│  └── Utils (Helpers)                           │
├─────────────────────────────────────────────────┤
│  API Layer                                      │
│  └── Axios (HTTP client con interceptors)     │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│           BACKEND API (Node.js)                 │
│              SQL Server Database                │
└─────────────────────────────────────────────────┘
```

### Capas de la Aplicación

#### 1. **Capa de Presentación**
- **Responsabilidad**: Renderizar UI, capturar interacciones
- **Tecnología**: React 18, TypeScript, Tailwind CSS
- **Patrón**: Componentes funcionales con hooks

#### 2. **Capa de Estado**
- **Global**: AuthContext, ToastContext
- **Server**: React Query para cache y sincronización
- **Local**: useState para UI temporal

#### 3. **Capa de Lógica**
- **Services**: Comunicación con API
- **Hooks personalizados**: Lógica reutilizable
- **Validaciones**: Zod para esquemas

#### 4. **Capa de Datos**
- **API Client**: Axios configurado
- **Interceptors**: Auth token, error handling
- **Type Safety**: TypeScript interfaces

---

## 🛠️ Stack Tecnológico

### Core

- **React 18.3+**: Framework principal
- **TypeScript 5.3+**: Type safety
- **Vite 5**: Build tool y dev server
- **React Router 6**: Navegación

### UI & Styling

- **Tailwind CSS 3.4**: Utility-first CSS
- **Radix UI**: Componentes accesibles headless
- **Lucide React**: Iconos modernos
- **Recharts**: Gráficos y visualizaciones

### State & Data

- **React Query**: Server state management
- **Zustand**: Alternative para estado global (opcional)
- **Axios**: HTTP client

### Forms & Validation

- **React Hook Form**: Gestión de formularios
- **Zod**: Schema validation

### Utilities

- **date-fns**: Manejo de fechas
- **clsx + tailwind-merge**: Utilidad de clases CSS
- **react-dropzone**: Drag & drop de archivos
- **papaparse**: Parser de CSV
- **xlsx**: Excel import/export

---

## 🎨 Diseño UX/UI

### Principios de Diseño

1. **Claridad Visual**: Jerarquía clara, espaciado generoso
2. **Feedback Inmediato**: Validaciones en tiempo real, toasts
3. **Eficiencia**: Atajos de teclado, autoguardado
4. **Accesibilidad**: Contraste adecuado, navegación por teclado
5. **Consistencia**: Patrones repetibles en toda la app

### Sistema de Colores

#### Modo Claro (Predeterminado)

```css
--primary: 221.2 83.2% 53.3%      /* Azul principal */
--secondary: 210 40% 96.1%        /* Gris claro */
--success: 142.1 76.2% 36.3%      /* Verde */
--warning: 38.3 92.1% 50.4%       /* Naranja/Amarillo */
--destructive: 0 84.2% 60.2%      /* Rojo */
--info: 199.6 89.2% 48.4%         /* Azul info */
--muted: 210 40% 96.1%            /* Fondo apagado */
--background: 0 0% 100%           /* Blanco */
--foreground: 222.2 84% 4.9%      /* Negro texto */
```

#### Modo Oscuro

```css
--primary: 217.2 91.2% 59.8%
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
/* ... colores ajustados para dark mode */
```

### Estados Visuales de Modelos

| Estado | Color | Badge | Uso |
|--------|-------|-------|-----|
| Importado | Info (Azul) | `bg-info` | Recién importado |
| Datos Mínimos | Secondary (Gris) | `bg-secondary` | En carga inicial |
| Equipamiento Cargado | Primary (Azul) | `bg-primary` | Listo para revisión |
| En Revisión | Warning (Amarillo) | `bg-warning` | Siendo revisado |
| Para Corregir | Destructive (Rojo) | `bg-destructive` | Requiere corrección |
| En Aprobación | Warning (Amarillo) | `bg-warning` | Esperando aprobación final |
| Aprobado | Success (Verde) | `bg-success` | Aprobado, pre-definitivo |
| Definitivo | Success (Verde) | `bg-success` | En base oficial |

### Tipografía

- **Font Family**: System font stack (sin fuentes custom para performance)
- **Headings**: 
  - h1: 3xl (30px), bold, tracking-tight
  - h2: 2xl (24px), semibold
  - h3: xl (20px), semibold
- **Body**: base (16px), regular
- **Small**: sm (14px), regular/medium

### Espaciado

- **Container padding**: p-6 (24px)
- **Card padding**: p-4 (16px)
- **Gap entre elementos**: gap-4 (16px) o gap-6 (24px)
- **Margin sections**: mb-6 (24px)

### Componentes UI

#### Button Variants

```tsx
<Button variant="default">    {/* Azul sólido */}
<Button variant="destructive"> {/* Rojo sólido */}
<Button variant="outline">    {/* Borde */}
<Button variant="ghost">      {/* Transparente hover */}
<Button variant="success">    {/* Verde sólido */}
<Button variant="warning">    {/* Amarillo/naranja */}
```

#### Input States

- **Normal**: Borde gris
- **Focus**: Ring azul (ring-primary)
- **Error**: Borde rojo + mensaje debajo
- **Disabled**: Opacity 50%, cursor-not-allowed

#### Cards

- **Borde**: border (1px gris)
- **Shadow**: shadow-sm (sutil)
- **Hover**: hover:shadow-md (transición)
- **Background**: bg-card

---

## 📁 Estructura de Carpetas

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes base reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/                # Componentes de layout
│   │   │   ├── Layout.tsx         # Layout principal con sidebar
│   │   │   ├── ProtectedRoute.tsx # HOC para rutas protegidas
│   │   │   ├── StatCard.tsx       # Card de estadísticas
│   │   │   └── PageHeader.tsx     # Header de página
│   │   ├── modelos/               # Componentes específicos de modelos
│   │   │   └── DatosMinimosForm.tsx
│   │   ├── equipamiento/
│   │   │   └── EquipamientoForm.tsx
│   │   ├── precios/
│   │   │   └── PreciosSection.tsx
│   │   ├── historial/
│   │   │   └── HistorialSection.tsx
│   │   └── import/
│   ├── pages/                     # Páginas principales
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ImportPage.tsx
│   │   ├── ModelosPage.tsx
│   │   └── ModeloDetailPage.tsx
│   ├── context/                   # Context providers
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/                     # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useAutosave.ts
│   │   ├── useForm.ts
│   │   └── useDebounce.ts
│   ├── services/                  # API services
│   │   ├── api.ts                 # Axios instance
│   │   ├── authService.ts
│   │   ├── modeloService.ts
│   │   ├── marcaService.ts
│   │   ├── equipamientoService.ts
│   │   ├── precioService.ts
│   │   ├── ventasService.ts
│   │   ├── importService.ts
│   │   └── dashboardService.ts
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   ├── utils/                     # Utilidades
│   │   └── cn.ts                  # Clase merger
│   ├── styles/
│   │   └── globals.css            # Estilos globales
│   ├── App.tsx                    # App principal
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts             # Vite types
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🧩 Componentes del Sistema

### Componentes UI Base

#### Button
```tsx
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Uso**: Todas las acciones del sistema  
**Características**: Loading state, variants, sizes

#### Input
```tsx
interface InputProps {
  type?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  value: string;
  onChange: (e) => void;
  required?: boolean;
  disabled?: boolean;
}
```

**Características**: Label automático, error display, validación visual

#### DataTable
```tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
}
```

**Características**:
- Ordenamiento por columnas
- Búsqueda global
- Paginación
- Row click navigation

#### Badge
```tsx
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  estado?: ModeloEstado; // Auto-mapea estado a variant
  children?: React.ReactNode;
}
```

**Uso**: Mostrar estados de modelos, etapas, categorías

### Componentes de Layout

#### Layout
- Sidebar fijo con navegación
- Top bar con título de página
- User menu con avatar
- Dark mode toggle
- Responsive (hamburger en mobile)

#### StatCard
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; isPositive: boolean };
}
```

**Uso**: Dashboard, vistas de resumen

### Componentes Especializados

#### DatosMinimosForm
- Formulario completo de datos técnicos
- Autoguardado cada 3 segundos
- Validación inline
- Indicador de último guardado
- ReadOnly mode para revisión

#### EquipamientoForm
- 140+ campos organizados en categorías
- Búsqueda de campos
- Marcar/desmarcar por categoría
- Campos checkbox y numéricos
- Scroll infinito con categorías colapsables

#### PreciosSection
- Historial de precios en tabla
- Gráfico de evolución (Recharts)
- Cards de precio actual y variación
- Modal para agregar nuevo precio
- Cierre automático de vigencia anterior

#### HistorialSection
- Tabla de cambios con todos los detalles
- Timeline view visual
- Export a Excel
- Filtros por usuario, fecha, campo

---

## 📄 Páginas y Flujos

### 1. Login Page

**Ruta**: `/login`  
**Acceso**: Público

**Elementos**:
- Card centrado
- Logo de la aplicación
- Formulario: Email + Password
- Botón de login con loading state
- Mensajes de error

**Flujo**:
1. Usuario ingresa credenciales
2. POST a `/api/auth/login`
3. Guarda token en localStorage
4. Guarda user en AuthContext
5. Redirect a `/dashboard`

---

### 2. Dashboard Page

**Ruta**: `/dashboard`  
**Acceso**: Todos los usuarios autenticados

**Elementos**:
- Saludo personalizado con nombre de usuario
- 4 StatCards:
  - Total de modelos
  - Pendientes asignados al usuario
  - En revisión (total sistema)
  - Aprobados (mes actual)
- Quick Actions (según rol):
  - Entrada datos: Importar, Ver Modelos
  - Revisión: Modelos en revisión, Ver modelos
  - Aprobación: Modelos por aprobar, Ver modelos
- Estado por Etapa (card con breakdown)
- Modelos Recientes (últimos 10)
- Actividad Reciente (últimas modificaciones)

**Flujo**:
1. useEffect carga `dashboardService.getStats()`
2. Muestra loading spinner
3. Renderiza stats con animations
4. Quick actions ejecutan navigate()

---

### 3. Import Page

**Ruta**: `/import`  
**Acceso**: Rol ENTRADA_DATOS, ADMIN

**Elementos**:
- Botón "Descargar Plantilla"
- Drag & Drop zone para archivos
- Preview de archivo:
  - Resumen: Total, Válidas, Con Errores
  - Tabla de errores con detalles por fila
  - Tabla de datos válidos (editable opcional)
- Botón "Importar X Modelos"

**Flujo Completo**:
1. Usuario hace clic en "Descargar Plantilla"
   - Download XLSX template con columnas esperadas
2. Usuario arrastra archivo o selecciona
3. POST `/api/import/preview` con FormData
4. Backend valida y retorna `ImportPreviewResult`
5. Se muestran 3 cards con totales
6. Si hay errores, tabla con detalles
7. Datos válidos se muestran en tabla
8. Usuario hace clic en "Importar"
9. POST `/api/import/execute` con array de datos válidos
10. Backend crea modelos y marcas
11. Toast de éxito
12. Navigate a `/modelos`

**Validaciones**:
- Campos obligatorios: marca, modelo
- Tipos de datos correctos
- Valores en rangos válidos
- Duplicados (opcional)

---

### 4. Modelos Page (Lista)

**Ruta**: `/modelos`  
**Acceso**: Todos

**Elementos**:
- PageHeader con botón "Nuevo Modelo"
- Panel de filtros:
  - Búsqueda por texto (debounced)
  - Select de Marca
  - Select de Estado
  - Input de Año
  - Botón "Limpiar Filtros"
- DataTable con columnas:
  - Marca
  - Modelo
  - Familia
  - Año
  - Combustible
  - Tipo
  - Estado (Badge)
  - Etapa
  - Responsable
  - Última Modificación
- Contador: "Mostrando X modelos"
- Paginación

**Flujo**:
1. useEffect con `modeloService.getAll(filters)`
2. Filtros actualizan `filters` state
3. useDebounce en search (500ms)
4. useEffect recarga cuando filters cambia
5. Click en fila: `navigate(/modelos/${id})`

**Optimizaciones**:
- Debounce en búsqueda
- Paginación backend
- Virtualized scroll para listas grandes (opcional)

---

### 5. Modelo Detail Page

**Ruta**: `/modelos/:id`  
**Acceso**: Todos (permisos de edición según rol)

**Elementos**:
- PageHeader:
  - Botón back
  - Título: "Marca Modelo"
  - Subtitle: "Familia • Año • Combustible"
  - Badge de Estado
  - Etapa actual
- Action Buttons (según estado y rol):
  - "Enviar a Revisión"
  - "Aprobar"
  - "Devolver para Corrección"
  - "Aprobar Definitivamente"
  - "Rechazar"
- Tabs:
  - **Datos Mínimos**: DatosMinimosForm
  - **Equipamiento**: EquipamientoForm
  - **Precios**: PreciosSection
  - **Historial**: HistorialSection

**Flujo de Navegación entre Tabs**:
1. Usuario selecciona tab
2. `activeTab` state cambia
3. Se renderiza el componente correspondiente
4. Componente carga sus propios datos

**Permisos de Edición**:
```typescript
function canEdit() {
  if (user.role === 'admin') return true;
  
  switch (user.role) {
    case 'entrada_datos':
      return ['importado', 'datos_minimos', 'equipamiento_cargado', 'para_corregir'].includes(modelo.estado);
    case 'revision':
      return modelo.estado === 'en_revision';
    case 'aprobacion':
      return modelo.estado === 'en_aprobacion';
  }
}
```

---

### Tab 1: Datos Mínimos

**Componente**: `DatosMinimosForm`

**Layout**: Cards por categoría
1. **Información General**
   - Familia, Origen, Combustible, Año
2. **Tipo y Categoría**
   - Tipo, Tipo2, Tipo de Vehículo, Segmento, Categoría, Importador
3. **Especificaciones Técnicas**
   - CC, HP, Turbo, Tracción, Caja, Tipo Caja
4. **Capacidades**
   - Puertas, Pasajeros

**Características**:
- Autoguardado activado (3seg delay)
- Indicador "Último guardado: HH:MM:SS"
- Botón "Guardar Manualmente"
- ReadOnly mode si no tiene permisos
- Validación inline

**Flujo Autoguardado**:
```typescript
useAutosave({
  data: formData,
  onSave: async (data) => {
    await modeloService.update(modeloId, data);
  },
  delay: 3000,
  enabled: !readOnly
});
```

---

### Tab 2: Equipamiento

**Componente**: `EquipamientoForm`

**Layout**: Cards por categoría
1. Seguridad (14 campos)
2. Confort (19 campos)
3. Multimedia (9 campos)
4. Exterior (8 campos)
5. Motor y Performance (12 campos)
6. Dimensiones (7 campos)

**Características**:
- Búsqueda de campos
- Botones "Marcar Todos" / "Desmarcar Todos" por categoría
- Mix de checkboxes y inputs numéricos
- Botón "Guardar" (NO autoguardado por cantidad de campos)

**Flujo**:
1. Carga equipamiento existente
2. Usuario modifica checkboxes/inputs
3. Click en "Guardar"
4. PUT `/api/equipamiento/modelo/:id` o POST si es nuevo
5. Toast de confirmación
6. Recarga datos

---

### Tab 3: Precios

**Componente**: `PreciosSection`

**Elementos**:
- 3 StatCards:
  - Precio Actual (con moneda)
  - Variación % (vs anterior)
  - Total de Precios
- Gráfico de evolución (Recharts LineChart)
- Tabla de historial de precios
- Botón "+ Agregar Precio"

**Modal "Agregar Precio"**:
- Input: Precio (requerido)
- Input: Vigencia Desde (date)
- Input: Moneda (default USD)
- Input: Observaciones

**Flujo**:
1. Usuario click "+ Agregar Precio"
2. Modal se abre
3. Completa campos
4. Click "Agregar"
5. POST `/api/precios/modelo`
6. Backend cierra vigencia del precio anterior (si existe)
7. Toast de éxito
8. Recarga precios
9. Actualiza gráfico

**ReadOnly**: Si estado !== 'definitivo', solo lectura

---

### Tab 4: Historial

**Componente**: `HistorialSection`

**Elementos**:
- Título con icono History
- Botón "Exportar" (Excel)
- DataTable con columnas:
  - Fecha
  - Usuario
  - Campo (Badge)
  - Valor Anterior
  - Valor Nuevo
  - Observaciones
- Timeline View:
  - Vista alternativa cronológica
  - Bolitas conectadas con línea vertical
  - Diff de valores resaltado

**Flujo Export**:
1. Click "Exportar"
2. Mapea historial a array de objetos simples
3. Usa XLSX para crear workbook
4. Download automático

---

## 👥 Sistema de Roles

### Roles Definidos

#### 1. ENTRADA_DATOS

**Permisos**:
- Importar modelos y marcas
- Crear nuevos modelos manualmente
- Editar datos mínimos
- Cargar equipamiento
- Ver sus propios modelos asignados
- **NO puede**: Revisar, Aprobar

**Pantallas Accesibles**:
- Dashboard
- Import
- Modelos (lista y detalle editable)

**Estados que puede modificar**:
- importado → datos_minimos
- datos_minimos → equipamiento_cargado
- equipamiento_cargado → en_revision
- para_corregir → datos_minimos (correcciones)

---

#### 2. REVISION

**Permisos**:
- Ver modelos en revisión
- Editar/corregir datos
- Aprobar (enviar a aprobación final)
- Devolver para corrección
- **NO puede**: Importar, Aprobación final

**Pantallas Accesibles**:
- Dashboard
- Modelos (lista y detalle editable si en_revision)
- Revisión (pantalla especializada)

**Estados que puede modificar**:
- en_revision → en_aprobacion (aprobar)
- en_revision → para_corregir (rechazar)

---

#### 3. APROBACION

**Permisos**:
- Ver modelos en aprobación
- Aprobar definitivamente
- Rechazar (devuelve a revisión)
- **NO puede**: Importar, Editar datos técnicos

**Pantallas Accesibles**:
- Dashboard
- Modelos (lista y detalle read-only)
- Aprobación (pantalla especializada)

**Estados que puede modificar**:
- en_aprobacion → definitivo (aprobar)
- en_aprobacion → en_revision (rechazar)

---

#### 4. ADMIN

**Permisos**:
- Todos los permisos anteriores
- Gestión de usuarios
- Configuración del sistema
- Bypass de validaciones

**Pantallas Accesibles**: Todas

---

### Implementación de Control de Acceso

#### En Rutas

```tsx
<Route path="/import" element={
  <ProtectedRoute allowedRoles={[UserRole.ENTRADA_DATOS, UserRole.ADMIN]}>
    <Layout><ImportPage /></Layout>
  </ProtectedRoute>
} />
```

#### En Componentes

```tsx
const canEdit = () => {
  if (!user || !modelo) return false;
  if (user.role === UserRole.ADMIN) return true;
  
  switch (user.role) {
    case UserRole.ENTRADA_DATOS:
      return ['importado', 'datos_minimos', ...].includes(modelo.estado);
    case UserRole.REVISION:
      return modelo.estado === 'en_revision';
    case UserRole.APROBACION:
      return modelo.estado === 'en_aprobacion';
    default:
      return false;
  }
};
```

#### En Sidebar

```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['all'] },
  { name: 'Importar', href: '/import', icon: Upload, roles: [UserRole.ENTRADA_DATOS, UserRole.ADMIN] },
  // ... filtrado dinámico
];

const filteredNavigation = navigation.filter(item => 
  item.roles.includes('all') || (user && item.roles.includes(user.role))
);
```

---

## 🔄 Estados y Flujo de Trabajo

### Diagrama de Estados

```
IMPORTADO
   ↓
DATOS_MINIMOS  ←─────┐
   ↓                 │
EQUIPAMIENTO_CARGADO │
   ↓                 │
EN_REVISION          │
   ↓          ↓      │
   │    PARA_CORREGIR┘
   ↓
EN_APROBACION
   ↓        ↓
   │    EN_REVISION (rechazado)
   ↓
APROBADO
   ↓
DEFINITIVO
```

### Estados Detallados

| Estado | Etapa | Descripción | Siguientes Estados | Rol Responsable |
|--------|-------|-------------|-------------------|-----------------|
| importado | 1 | Recién importado desde archivo | datos_minimos | Entrada Datos |
| datos_minimos | 2 | Completando datos básicos | equipamiento_cargado | Entrada Datos |
| equipamiento_cargado | 3 | Equipamiento completo | en_revision | Entrada Datos |
| en_revision | 4 | Siendo revisado | en_aprobacion, para_corregir | Revisión |
| para_corregir | 2 | Requiere correcciones | datos_minimos | Entrada Datos |
| en_aprobacion | 4 | Esperando aprobación final | aprobado, en_revision | Aprobación |
| aprobado | 4 | Aprobado pre-definitivo | definitivo | Aprobación |
| definitivo | 4 | En base oficial | - | - |

### Transiciones de Estado

#### Función: cambiarEstado

```tsx
POST /api/modelos/:id/estado
Body: {
  nuevo_estado: ModeloEstado,
  observaciones?: string
}
```

**Backend**:
1. Valida transición permitida
2. Actualiza estado del modelo
3. Actualiza responsable_actual_id
4. Crea registro en ModeloEstado (tracking)
5. Crea entrada en ModeloHistorial
6. Retorna modelo actualizado

**Frontend**:
```tsx
await modeloService.cambiarEstado(modeloId, {
  nuevo_estado: ModeloEstado.EN_REVISION,
  observaciones: 'Completado equipamiento'
});
```

### Validaciones por Estado

#### datos_minimos → equipamiento_cargado

**Validaciones**:
- ✅ Familia requerida
- ✅ Combustible requerido
- ✅ Año requerido
- ✅ Tipo requerido

#### equipamiento_cargado → en_revision

**Validaciones**:
- ✅ Al menos 30% de equipamiento completado
- ✅ Campos críticos de seguridad completados

#### en_aprobacion → definitivo

**Validaciones**:
- ✅ Todos los datos completos
- ✅ Sin observaciones pendientes
- ✅ Revisado y aprobado previamente

---

## 🎯 Patrones de Diseño

### 1. Composition Pattern

```tsx
// Layout compone múltiples componentes
<Layout>
  <PageHeader />
  <Content />
  <Footer />
</Layout>
```

### 2. Render Props

```tsx
<DataTable
  data={modelos}
  columns={columns}
  renderRow={(row) => <CustomRow {...row} />}
/>
```

### 3. Custom Hooks

```tsx
// Lógica reutilizable encapsulada
const { isSaving, lastSaved } = useAutosave({
  data: formData,
  onSave: handleSave,
  delay: 3000
});
```

### 4. Context + Provider

```tsx
// Estado global sin prop drilling
<AuthProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</AuthProvider>
```

### 5. Service Layer

```tsx
// Separación de lógica de negocio
export const modeloService = {
  getAll: async (filters) => {...},
  getById: async (id) => {...},
  update: async (id, data) => {...},
};
```

### 6. Protected Routes

```tsx
// HOC para rutas protegidas
<ProtectedRoute allowedRoles={[Role.ADMIN]}>
  <AdminPanel />
</ProtectedRoute>
```

---

## ✅ Validaciones

### Validación de Formularios

#### Client-side (inmediata)

```tsx
const validate = (values) => {
  const errors = {};
  
  if (!values.familia) {
    errors.familia = 'Familia es requerida';
  }
  
  if (values.año && (values.año < 1900 || values.año > new Date().getFullYear() + 1)) {
    errors.año = 'Año inválido';
  }
  
  if (values.cc && values.cc < 0) {
    errors.cc = 'Cilindrada debe ser positiva';
  }
  
  return errors;
};
```

#### Server-side (seguridad)

Backend valida nuevamente y retorna errores:

```json
{
  "success": false,
  "errors": {
    "familia": "Familia es requerida",
    "año": "Año debe estar entre 1900 y 2026"
  }
}
```

### Validación de Archivos Import

```tsx
interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}
```

**Validaciones**:
- Formato de archivo correcto
- Columnas obligatorias presentes
- Tipos de datos correctos por columna
- Valores en rangos válidos
- Marca existe o es válida para crear

### Validación de Permisos

```tsx
// En cada endpoint
if (!canUserEditModel(user, modelo)) {
  return res.status(403).json({ message: 'No autorizado' });
}
```

---

## 📚 Guía de Implementación

### Paso 1: Setup Inicial

```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con VITE_API_URL
npm run dev
```

### Paso 2: Configurar Backend Connection

Verificar que `vite.config.ts` tenga proxy correcto:

```ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

### Paso 3: Orden de Desarrollo Recomendado

1. **Componentes UI base** ✅ (ya creados)
2. **Context y Auth** ✅ (ya creado)
3. **Services** ✅ (ya creados)
4. **Login Page** ✅ (ya creado)
5. **Dashboard** ✅ (ya creado)
6. **Modelos Lista** ✅ (ya creado)
7. **Modelo Detalle** ✅ (ya creado)
8. **Import Page** ✅ (ya creado)
9. Revisión Page (por hacer)
10. Aprobación Page (por hacer)
11. Precios y Ventas (páginas independientes)
12. Configuración y Usuarios

### Paso 4: Testing

```bash
# Unit tests
npm run test

# E2E tests (Cypress/Playwright)
npm run test:e2e

# Linting
npm run lint
```

### Paso 5: Build para Producción

```bash
npm run build
npm run preview  # Preview build
```

---

## 🔍 Características Avanzadas

### Autoguardado

**Implementación**:
- Hook `useAutosave`
- Delay configurable (default 3s)
- Debounce de cambios
- Indicador visual de estado
- Error handling

### Búsqueda Inteligente

**DataTable**:
- Global filter en todas las columnas
- Debounced (evita llamadas excesivas)
- Case-insensitive

**Backend**:
- Full-text search en campos principales
- Filtros combinados con AND

### Trazabilidad

**Cada cambio genera**:
- Entrada en `ModeloHistorial`
- Tracking de usuario
- Timestamp
- Diff de valores

**Visualización**:
- Tabla completa
- Timeline cronológico
- Export a Excel

### Notificaciones (Toasts)

**Tipos**:
- Success: Verde
- Error: Rojo
- Warning: Amarillo
- Info: Azul

**Auto-dismiss**: 5 segundos  
**Manual close**: Botón X

### Dark Mode

**Toggle** en sidebar  
**Persistencia**: localStorage  
**CSS Variables**: Automático con Tailwind

---

## 🎓 Best Practices Implementadas

### Performance

- ✅ Code splitting por ruta
- ✅ Lazy loading de componentes pesados
- ✅ Memoización con React.memo
- ✅ Debounce en búsquedas
- ✅ Paginación server-side

### Seguridad

- ✅ JWT en headers
- ✅ Token refresh automático
- ✅ Rutas protegidas
- ✅ Validación client + server
- ✅ HTTPS en producción

### Accesibilidad

- ✅ Navegación por teclado
- ✅ ARIA labels
- ✅ Contraste adecuado (WCAG AA)
- ✅ Focus visible
- ✅ Tooltips informativos

### UX

- ✅ Loading states
- ✅ Error boundaries
- ✅ Feedback inmediato
- ✅ Confirmaciones de acciones destructivas
- ✅ Breadcrumbs y navegación clara

### Código

- ✅ TypeScript strict mode
- ✅ ESLint configured
- ✅ Prettier para formato
- ✅ Nombres descriptivos
- ✅ Componentes pequeños y reutilizables

---

## 📝 Próximos Pasos (Roadmap)

### Fase 2 (Completar funcionalidades)

- [ ] Revisión Page (lista especializada para revisores)
- [ ] Aprobación Page (lista especializada para aprobadores)
- [ ] Ventas Page (gestión de ventas mensuales)
- [ ] Usuarios Page (CRUD de usuarios y roles)
- [ ] Configuración Page (settings del sistema)

### Fase 3 (Mejoras)

- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Dashboard con más métricas
- [ ] Gráficos avanzados (ventas, tendencias)
- [ ] Exportar reportes PDF
- [ ] Búsqueda avanzada con múltiples criterios
- [ ] Versiones de modelos
- [ ] Comparador de modelos

### Fase 4 (Optimizaciones)

- [ ] PWA (Progressive Web App)
- [ ] Offline support
- [ ] Cache estratégico
- [ ] Optimización de imágenes
- [ ] Lazy loading de imágenes
- [ ] Virtual scrolling en tablas grandes

---

## 🎯 Conclusión

Este documento proporciona una especificación completa y detallada del frontend del sistema de gestión automotriz. La implementación actual incluye:

✅ **Estructura completa** de carpetas y archivos  
✅ **Componentes UI** reutilizables y modernos  
✅ **Páginas principales** funcionales  
✅ **Sistema de roles** y permisos  
✅ **Flujo de trabajo** completo de 4 etapas  
✅ **Validaciones** client y server  
✅ **Autoguardado** y UX optimizada  
✅ **Trazabilidad** total de cambios  
✅ **Design system** consistente  
✅ **TypeScript** para type safety  

El sistema está listo para desarrollo adicional siguiendo los patrones establecidos.

---

**Versión**: 1.0  
**Fecha**: Diciembre 2025  
**Desarrollado con**: React 18, TypeScript, Tailwind CSS, Radix UI
