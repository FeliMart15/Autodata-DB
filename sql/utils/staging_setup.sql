-- =============================================
-- Script: Configuración de Tabla Staging
-- Descripción: Tabla staging para importación masiva CSV
-- Fecha: 20 de Enero, 2026
-- =============================================

USE Autodata;
GO

-- Crear esquema staging si no existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'stg')
BEGIN
    EXEC('CREATE SCHEMA stg');
    PRINT 'Schema stg creado';
END
GO

-- Tabla staging para importación CSV de Claudio
IF OBJECT_ID('stg.Claudio_Modelos', 'U') IS NOT NULL
BEGIN
    DROP TABLE stg.Claudio_Modelos;
    PRINT 'Tabla stg.Claudio_Modelos eliminada (se recreará)';
END
GO

CREATE TABLE stg.Claudio_Modelos (
    load_id INT IDENTITY(1,1) PRIMARY KEY,
    load_batch_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    load_timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    load_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSED, ERROR
    load_error_message NVARCHAR(MAX),
    
    -- Datos del CSV (todas las columnas como NVARCHAR para recibir cualquier dato)
    marca NVARCHAR(100),
    modelo NVARCHAR(200),
    anio NVARCHAR(10),
    version NVARCHAR(500),
    combustible NVARCHAR(50),
    tipo NVARCHAR(50),
    origen NVARCHAR(100),
    categoria NVARCHAR(100),
    segmento NVARCHAR(100),
    cc NVARCHAR(20),
    hp NVARCHAR(20),
    traccion NVARCHAR(50),
    caja NVARCHAR(100),
    turbo NVARCHAR(10),
    puertas NVARCHAR(10),
    pasajeros NVARCHAR(10),
    precio NVARCHAR(50),
    moneda NVARCHAR(10),
    
    -- Equipamiento (columnas opcionales del CSV)
    airbag_conductor NVARCHAR(10),
    airbag_acompanante NVARCHAR(10),
    airbags_laterales NVARCHAR(10),
    airbags_cortina NVARCHAR(10),
    abs NVARCHAR(10),
    control_estabilidad NVARCHAR(10),
    control_traccion NVARCHAR(10),
    asistente_arranque_pendiente NVARCHAR(10),
    climatizador NVARCHAR(10),
    aire_acondicionado NVARCHAR(10),
    direccion_asistida NVARCHAR(10),
    sensores_estacionamiento NVARCHAR(10),
    camara_retroceso NVARCHAR(10),
    cierre_centralizado NVARCHAR(10),
    apertura_baul_electrica NVARCHAR(10),
    llantas_aleacion NVARCHAR(10),
    faros_niebla NVARCHAR(10),
    faros_led NVARCHAR(10),
    tapizado NVARCHAR(50),
    regulacion_volante NVARCHAR(50),
    asientos_electricos NVARCHAR(10),
    espejos_electricos NVARCHAR(10),
    cristales_electricos NVARCHAR(50)
);

CREATE NONCLUSTERED INDEX IX_Staging_Batch ON stg.Claudio_Modelos(load_batch_id);
CREATE NONCLUSTERED INDEX IX_Staging_Status ON stg.Claudio_Modelos(load_status);

PRINT 'Tabla stg.Claudio_Modelos creada exitosamente';
GO
