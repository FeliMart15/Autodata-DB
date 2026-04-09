# 📊 PLAN DE IMPLEMENTACIÓN - MÓDULO DE VENTAS Y EMPADRONAMIENTOS

## 📋 Fecha: 1 de Febrero, 2026
## 🎯 Objetivo: Sistema eficiente para cargar ventas y empadronamientos masivos

---

## 1. ANÁLISIS DE REQUERIMIENTOS

### 1.1 Funcionalidades Principales

#### A. Ventas (Generales)
- Registrar ventas por modelo
- Sin distinción de departamento
- Historial temporal (mes/año)

#### B. Empadronamientos (Por Departamento)
- Registrar empadronamientos por modelo
- **Diferenciador:** Incluye departamento
- Historial temporal y geográfico

### 1.2 Flujo de Usuario
```
1. Usuario → Módulo Ventas/Empadronamientos
2. Selecciona: [Cargar Ventas] o [Cargar Empadronamientos]
3. Selecciona: Marca (ej: Audi)
4. Selecciona: Familia (ej: A3, Q3, TT)
5. Visualiza: Tabla con TODOS los modelos de esa familia
6. Carga: Ventas/Empadronamientos en batch (múltiples a la vez)
7. Guarda: Todo el lote en una operación
```

### 1.3 Requisitos de Eficiencia
- ✅ Carga masiva (múltiples modelos simultáneamente)
- ✅ Validación en tiempo real
- ✅ Autocompletado de datos repetitivos
- ✅ Guardado batch (no uno por uno)
- ✅ Historial fácil de consultar

---

## 2. DISEÑO DE BASE DE DATOS

### 2.1 Nuevas Tablas Necesarias

#### Tabla: `Departamento`
```sql
CREATE TABLE Departamento (
    DepartamentoID INT IDENTITY(1,1) PRIMARY KEY,
    Codigo NVARCHAR(10) NOT NULL UNIQUE,           -- ARG-01, ARG-02, etc.
    Nombre NVARCHAR(100) NOT NULL UNIQUE,          -- Montevideo, Canelones, etc.
    Pais NVARCHAR(100) NOT NULL DEFAULT 'Uruguay', -- Escalable a otros países
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    INDEX IX_Departamento_Codigo (Codigo),
    INDEX IX_Departamento_Activo (Activo)
);
```

#### Tabla: `Venta`
```sql
CREATE TABLE Venta (
    VentaID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 0,
    Periodo NVARCHAR(7) NOT NULL,              -- Formato: YYYY-MM (2026-01)
    Año INT NOT NULL,                          -- 2026
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12), -- 1-12
    
    -- Auditoría
    CreadoPorID INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_Venta_Modelo FOREIGN KEY (ModeloID) 
        REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_Venta_CreadoPor FOREIGN KEY (CreadoPorID) 
        REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_Venta_ModificadoPor FOREIGN KEY (ModificadoPorID) 
        REFERENCES Usuario(UsuarioID),
    
    -- Constraints
    CONSTRAINT CK_Venta_Cantidad CHECK (Cantidad >= 0),
    CONSTRAINT UQ_Venta_Modelo_Periodo UNIQUE (ModeloID, Periodo),
    
    -- Índices para performance
    INDEX IX_Venta_ModeloID (ModeloID),
    INDEX IX_Venta_Periodo (Periodo DESC),
    INDEX IX_Venta_Año_Mes (Año DESC, Mes DESC),
    INDEX IX_Venta_FechaCreacion (FechaCreacion DESC)
);
```

#### Tabla: `Empadronamiento`
```sql
CREATE TABLE Empadronamiento (
    EmpadronamientoID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL,
    DepartamentoID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 0,
    Periodo NVARCHAR(7) NOT NULL,              -- Formato: YYYY-MM (2026-01)
    Año INT NOT NULL,                          -- 2026
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12), -- 1-12
    
    -- Auditoría
    CreadoPorID INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_Empadronamiento_Modelo FOREIGN KEY (ModeloID) 
        REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_Empadronamiento_Departamento FOREIGN KEY (DepartamentoID) 
        REFERENCES Departamento(DepartamentoID),
    CONSTRAINT FK_Empadronamiento_CreadoPor FOREIGN KEY (CreadoPorID) 
        REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_Empadronamiento_ModificadoPor FOREIGN KEY (ModificadoPorID) 
        REFERENCES Usuario(UsuarioID),
    
    -- Constraints
    CONSTRAINT CK_Empadronamiento_Cantidad CHECK (Cantidad >= 0),
    CONSTRAINT UQ_Empadronamiento_Modelo_Periodo_Depto 
        UNIQUE (ModeloID, DepartamentoID, Periodo),
    
    -- Índices para performance
    INDEX IX_Empadronamiento_ModeloID (ModeloID),
    INDEX IX_Empadronamiento_DepartamentoID (DepartamentoID),
    INDEX IX_Empadronamiento_Periodo (Periodo DESC),
    INDEX IX_Empadronamiento_Año_Mes (Año DESC, Mes DESC),
    INDEX IX_Empadronamiento_FechaCreacion (FechaCreacion DESC)
);
```

### 2.2 Vistas Útiles

#### Vista: `vw_VentasPorModelo`
```sql
CREATE VIEW vw_VentasPorModelo AS
SELECT 
    m.ModeloID,
    m.DescripcionModelo,
    m.Familia,
    ma.Marca,
    ma.MarcaID,
    v.VentaID,
    v.Cantidad,
    v.Periodo,
    v.Año,
    v.Mes,
    v.FechaCreacion,
    u.Nombre AS CargadoPor
FROM Venta v
INNER JOIN Modelo m ON v.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
INNER JOIN Usuario u ON v.CreadoPorID = u.UsuarioID
WHERE m.Activo = 1;
```

#### Vista: `vw_EmpadronamientosPorModelo`
```sql
CREATE VIEW vw_EmpadronamientosPorModelo AS
SELECT 
    m.ModeloID,
    m.DescripcionModelo,
    m.Familia,
    ma.Marca,
    ma.MarcaID,
    d.DepartamentoID,
    d.Nombre AS Departamento,
    d.Codigo AS CodigoDepartamento,
    e.EmpadronamientoID,
    e.Cantidad,
    e.Periodo,
    e.Año,
    e.Mes,
    e.FechaCreacion,
    u.Nombre AS CargadoPor
FROM Empadronamiento e
INNER JOIN Modelo m ON e.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
INNER JOIN Departamento d ON e.DepartamentoID = d.DepartamentoID
INNER JOIN Usuario u ON e.CreadoPorID = u.UsuarioID
WHERE m.Activo = 1;
```

#### Vista: `vw_ResumenVentasPorFamilia`
```sql
CREATE VIEW vw_ResumenVentasPorFamilia AS
SELECT 
    ma.MarcaID,
    ma.Marca,
    m.Familia,
    v.Año,
    v.Mes,
    v.Periodo,
    COUNT(DISTINCT m.ModeloID) AS CantidadModelos,
    SUM(v.Cantidad) AS TotalVentas
FROM Venta v
INNER JOIN Modelo m ON v.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
WHERE m.Activo = 1
GROUP BY ma.MarcaID, ma.Marca, m.Familia, v.Año, v.Mes, v.Periodo;
```

---

## 3. ARQUITECTURA DE API

### 3.1 Endpoints Necesarios

#### GET `/api/ventas/familias`
**Query Params:** `?marcaId={id}`  
**Response:**
```json
{
  "success": true,
  "data": [
    "A3", "A4", "A5", "Q3", "Q5", "TT"
  ]
}
```

#### GET `/api/ventas/modelos-por-familia`
**Query Params:** `?marcaId={id}&familia={nombre}`  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "modeloId": 123,
      "descripcionModelo": "Audi A3 Turbo 2.0",
      "familia": "A3",
      "año": 2024,
      "ventasUltimoMes": 15,
      "periodo": "2026-01"
    }
  ]
}
```

#### POST `/api/ventas/crear-batch`
**Request:**
```json
{
  "periodo": "2026-01",
  "ventas": [
    { "modeloId": 123, "cantidad": 15 },
    { "modeloId": 124, "cantidad": 8 },
    { "modeloId": 125, "cantidad": 22 }
  ]
}
```

#### POST `/api/empadronamientos/crear-batch`
**Request:**
```json
{
  "periodo": "2026-01",
  "departamentoId": 5,
  "empadronamientos": [
    { "modeloId": 123, "cantidad": 15 },
    { "modeloId": 124, "cantidad": 8 }
  ]
}
```

#### GET `/api/ventas/historial`
**Query Params:** `?modeloId={id}&desde={YYYY-MM}&hasta={YYYY-MM}`  
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ventaId": 456,
      "periodo": "2026-01",
      "cantidad": 15,
      "cargadoPor": "Juan Pérez",
      "fechaCreacion": "2026-01-15T10:30:00"
    }
  ]
}
```

#### GET `/api/departamentos`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "departamentoId": 1,
      "codigo": "URU-01",
      "nombre": "Montevideo",
      "activo": true
    }
  ]
}
```

---

## 4. DISEÑO DE INTERFAZ (FRONTEND)

### 4.1 Estructura de Componentes

```
pages/
├── VentasPage.tsx                  // Página principal
└── EmpadronamientosPage.tsx        // Página de empadronamientos

components/
├── ventas/
│   ├── VentasForm.tsx              // Formulario principal
│   ├── FamiliaSelector.tsx         // Selector de familia
│   ├── ModelosTable.tsx            // Tabla editable de modelos
│   ├── VentasBatchInput.tsx        // Input para carga masiva
│   └── HistorialVentas.tsx         // Historial por modelo
└── empadronamientos/
    ├── EmpadronamientosForm.tsx
    ├── DepartamentoSelector.tsx
    └── ModelosTableEmpadronamiento.tsx
```

### 4.2 Flujo de Pantallas

#### Pantalla 1: Selección Inicial
```
┌─────────────────────────────────────────────┐
│  MÓDULO DE VENTAS Y EMPADRONAMIENTOS        │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────┐  ┌──────────────────┐│
│  │                   │  │                  ││
│  │   📊 CARGAR      │  │  📋 CARGAR       ││
│  │     VENTAS        │  │  EMPADRONAMIENTOS││
│  │                   │  │                  ││
│  └───────────────────┘  └──────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

#### Pantalla 2: Carga de Ventas
```
┌─────────────────────────────────────────────────────────────┐
│  CARGAR VENTAS                                    [← Volver]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 Período: [  Enero 2026  ▼]  (Selector mes/año)        │
│                                                             │
│  🚗 Marca:   [  Audi         ▼]  (Dropdown)               │
│                                                             │
│  📂 Familia: [  A3           ▼]  (Dropdown dinámico)      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  MODELOS DE LA FAMILIA "A3"                                │
├──────┬───────────────────────────┬─────────┬───────────────┤
│ Sel  │ Modelo                    │ Cantidad│ Último Período│
├──────┼───────────────────────────┼─────────┼───────────────┤
│ [✓]  │ Audi A3 Turbo 2.0         │  [  15] │  12 (Dic 25)  │
│ [✓]  │ Audi A3 Full Premium      │  [   8] │   5 (Dic 25)  │
│ [✓]  │ Audi A3 Comfortline       │  [  22] │  18 (Dic 25)  │
│ [ ]  │ Audi A3 Sportback         │  [   0] │   0 (Sin datos│
└──────┴───────────────────────────┴─────────┴───────────────┘
│                                                             │
│  [🔄 Cargar Otra Familia]  [💾 Guardar Todo]             │
└─────────────────────────────────────────────────────────────┘
```

#### Pantalla 3: Carga de Empadronamientos
```
┌─────────────────────────────────────────────────────────────┐
│  CARGAR EMPADRONAMIENTOS                          [← Volver]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 Período:      [  Enero 2026  ▼]                        │
│  📍 Departamento: [  Montevideo  ▼]  ⭐                    │
│  🚗 Marca:        [  Audi        ▼]                        │
│  📂 Familia:      [  A3          ▼]                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  MODELOS - EMPADRONAMIENTOS EN MONTEVIDEO                  │
├──────┬───────────────────────────┬─────────┬───────────────┤
│ Sel  │ Modelo                    │ Cantidad│ Último Período│
├──────┼───────────────────────────┼─────────┼───────────────┤
│ [✓]  │ Audi A3 Turbo 2.0         │  [  45] │  38 (Dic 25)  │
│ [✓]  │ Audi A3 Full Premium      │  [  28] │  22 (Dic 25)  │
│ [✓]  │ Audi A3 Comfortline       │  [  67] │  54 (Dic 25)  │
│ [ ]  │ Audi A3 Sportback         │  [   0] │   0 (Sin datos│
└──────┴───────────────────────────┴─────────┴───────────────┘
│                                                             │
│  [🔄 Cargar Otro Departamento]  [💾 Guardar Todo]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. CARACTERÍSTICAS DE EFICIENCIA

### 5.1 Carga Masiva Optimizada

#### A. Guardado Batch
- Un solo endpoint guarda múltiples registros
- Transacción única en BD
- Rollback automático si falla alguno

#### B. Validación Inteligente
```typescript
// Validación en frontend antes de enviar
const validaciones = {
  - Período no puede ser futuro > 1 mes
  - Cantidad debe ser >= 0
  - No puede haber duplicados en el mismo período
  - Advertencia si cantidad es 0 (permite guardar)
};
```

#### C. Autocompletado de Datos
- **Período**: Defaultea al mes actual
- **Último valor**: Muestra ventas del mes anterior como referencia
- **Familia anterior**: Recuerda la última familia seleccionada
- **Copiar del mes anterior**: Botón para copiar cantidades

#### D. Teclado Rápido
```
- Tab: Siguiente campo
- Enter: Siguiente modelo
- Ctrl+S: Guardar
- Ctrl+N: Nueva familia
- Esc: Cancelar
```

### 5.2 Performance

#### A. Queries Optimizadas
```sql
-- Índices compuestos para consultas frecuentes
CREATE INDEX IX_Venta_Compuesto 
    ON Venta(ModeloID, Periodo, Cantidad);

CREATE INDEX IX_Empadronamiento_Compuesto 
    ON Empadronamiento(ModeloID, DepartamentoID, Periodo, Cantidad);
```

#### B. Paginación en Tabla
- Mostrar máximo 50 modelos por familia
- Scroll virtual si hay más de 50
- Búsqueda/filtro en tabla

#### C. Cache en Frontend
```typescript
// Cachear opciones frecuentes
const cache = {
  marcas: [], // Se cargan una vez
  familias: {}, // Por marca
  departamentos: [] // Se cargan una vez
};
```

---

## 6. INTEGRACIÓN CON MÓDULO DE MODELOS

### 6.1 Visualización en Detalle de Modelo

Agregar nuevas secciones en la página de detalle:

```tsx
<ModeloDetalle>
  {/* ...datos existentes... */}
  
  {/* NUEVA SECCIÓN */}
  <Section title="📊 Ventas">
    <VentasChart modeloId={modelo.id} />
    <VentasTable 
      data={ventasHistorial}
      columns={['Período', 'Cantidad', 'Variación %']}
    />
  </Section>
  
  {/* NUEVA SECCIÓN */}
  <Section title="📋 Empadronamientos">
    <EmpadronamientosMap modeloId={modelo.id} />
    <EmpadronamientosPorDepartamento
      data={empadronamientosHistorial}
    />
  </Section>
</ModeloDetalle>
```

### 6.2 Nuevas Columnas en Tabla de Modelos

```tsx
<Column header="Ventas (Mes Actual)" 
        render={(modelo) => modelo.ventasMesActual || 0} />

<Column header="Ventas (Últimos 3 meses)" 
        render={(modelo) => modelo.ventasUltimos3Meses || 0} />

<Column header="Empadronamientos Totales" 
        render={(modelo) => modelo.empadronamientosTotales || 0} />
```

---

## 7. PLAN DE IMPLEMENTACIÓN

### FASE 1: Base de Datos (1-2 días)
- [ ] Crear tabla `Departamento` con seed inicial
- [ ] Crear tabla `Venta`
- [ ] Crear tabla `Empadronamiento`
- [ ] Crear vistas de consulta
- [ ] Crear stored procedures para batch insert
- [ ] Agregar índices optimizados

### FASE 2: Backend API (2-3 días)
- [ ] Controller: `ventasController.js`
  - GET familias por marca
  - GET modelos por familia
  - POST crear ventas batch
  - GET historial ventas
  - PUT actualizar venta
  - DELETE eliminar venta
- [ ] Controller: `empadronamientosController.js`
  - POST crear empadronamientos batch
  - GET historial empadronamientos
  - PUT actualizar empadronamiento
- [ ] Controller: `departamentosController.js`
  - GET listar departamentos
- [ ] Routes: Configurar rutas protegidas
- [ ] Middleware: Validación de datos

### FASE 3: Frontend - Componentes Base (2-3 días)
- [ ] Crear tipos TypeScript
- [ ] Servicios API (ventasService.ts, empadronamientosService.ts)
- [ ] Componentes selector (Marca, Familia, Departamento)
- [ ] Componente tabla editable de modelos
- [ ] Hooks personalizados (useVentas, useEmpadronamientos)

### FASE 4: Frontend - Páginas (2-3 días)
- [ ] VentasPage.tsx con formulario completo
- [ ] EmpadronamientosPage.tsx con formulario completo
- [ ] Validaciones en tiempo real
- [ ] Mensajes de error/éxito
- [ ] Loading states

### FASE 5: Integración y Visualización (2 días)
- [ ] Agregar sección de ventas en detalle de modelo
- [ ] Agregar sección de empadronamientos en detalle de modelo
- [ ] Gráficos de tendencias (opcional)
- [ ] Mapa de empadronamientos por departamento (opcional)

### FASE 6: Testing y Optimización (1-2 días)
- [ ] Pruebas de carga batch (100+ registros)
- [ ] Pruebas de performance de queries
- [ ] Validación de constraints
- [ ] Testing de usuarios
- [ ] Ajustes finales

**TIEMPO TOTAL ESTIMADO: 10-15 días hábiles**

---

## 8. CONSIDERACIONES ESPECIALES

### 8.1 Permisos por Rol
```javascript
const permisos = {
  'entrada_datos': ['crear_ventas', 'crear_empadronamientos'],
  'revision': ['ver_ventas', 'ver_empadronamientos'],
  'aprobacion': ['ver_ventas', 'ver_empadronamientos', 'eliminar_datos_incorrectos'],
  'admin': ['*'] // Todos los permisos
};
```

### 8.2 Auditoría
- Todos los cambios registrados con usuario y fecha
- No eliminar registros, marcar como inactivos
- Log de importaciones masivas

### 8.3 Validaciones de Negocio
- ✅ No permitir cargar períodos duplicados
- ✅ Advertir si cantidad es significativamente diferente al mes anterior
- ✅ No permitir períodos futuros (excepto mes siguiente)
- ✅ Validar que el modelo esté activo

### 8.4 Reportes y Exportación
- Exportar a Excel (ventas/empadronamientos)
- Comparativas mes a mes
- Top 10 modelos más vendidos
- Análisis por departamento

---

## 9. MOCKUP DE DATOS (Para Testing)

### Departamentos de Uruguay
```sql
INSERT INTO Departamento (Codigo, Nombre) VALUES
('URU-01', 'Montevideo'),
('URU-02', 'Canelones'),
('URU-03', 'Maldonado'),
('URU-04', 'Rocha'),
('URU-05', 'Colonia'),
('URU-06', 'San José'),
('URU-07', 'Flores'),
('URU-08', 'Florida'),
('URU-09', 'Lavalleja'),
('URU-10', 'Treinta y Tres'),
('URU-11', 'Cerro Largo'),
('URU-12', 'Rivera'),
('URU-13', 'Artigas'),
('URU-14', 'Salto'),
('URU-15', 'Paysandú'),
('URU-16', 'Río Negro'),
('URU-17', 'Soriano'),
('URU-18', 'Durazno'),
('URU-19', 'Tacuarembó');
```

---

## 10. ALTERNATIVAS Y MEJORAS FUTURAS

### V2.0 - Mejoras Propuestas
- 📈 Dashboard ejecutivo con KPIs
- 🗺️ Mapa de calor de empadronamientos
- 📊 Predicción de ventas con IA
- 📤 Importación masiva desde Excel
- 🔔 Alertas de variaciones anómalas
- 📱 Versión mobile optimizada
- 🔄 Sincronización offline
- 📧 Reportes automáticos por email

---

## ✅ CHECKLIST FINAL

Antes de considerar el módulo completo:

- [ ] Base de datos creada y poblada
- [ ] API funcionando con todos los endpoints
- [ ] Frontend con todas las pantallas
- [ ] Validaciones completas
- [ ] Permisos por rol implementados
- [ ] Auditoría funcionando
- [ ] Performance testeada
- [ ] Documentación actualizada
- [ ] Testing con usuarios reales
- [ ] Deploy en desarrollo

---

**📌 PRÓXIMO PASO:** Revisar y aprobar este plan antes de comenzar la implementación.

¿Te parece bien este enfoque? ¿Hay algo que quieras modificar o agregar?
