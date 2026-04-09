-- =============================================
-- Script: Crear Tablas de Refresh Tokens y Auditoría
-- Descripción: Implementa sistema de refresh tokens y auditoría de accesos
-- Fecha: 1 de Febrero, 2026
-- =============================================

USE Autodata;
GO

PRINT '==============================================';
PRINT 'CREANDO TABLAS DE SEGURIDAD';
PRINT '==============================================';
PRINT '';

-- =============================================
-- Tabla: RefreshToken
-- Descripción: Almacena tokens de refresco para autenticación prolongada
-- =============================================

IF OBJECT_ID('RefreshToken', 'U') IS NOT NULL
BEGIN
    PRINT 'Eliminando tabla RefreshToken existente...';
    DROP TABLE RefreshToken;
END
GO

CREATE TABLE RefreshToken (
    RefreshTokenID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    Token NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    RevokedAt DATETIME2 NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    ReplacedByToken NVARCHAR(500) NULL,
    DeviceInfo NVARCHAR(500) NULL,
    IpAddress NVARCHAR(50) NULL,
    
    CONSTRAINT FK_RefreshToken_Usuario FOREIGN KEY (UsuarioID) 
        REFERENCES Usuario(UsuarioID) ON DELETE CASCADE,
    
    INDEX IX_RefreshToken_Token (Token),
    INDEX IX_RefreshToken_Usuario (UsuarioID),
    INDEX IX_RefreshToken_ExpiresAt (ExpiresAt),
    INDEX IX_RefreshToken_IsRevoked (IsRevoked)
);
GO

PRINT '✅ Tabla RefreshToken creada exitosamente';
PRINT '';

-- =============================================
-- Tabla: AuditoriaAcceso
-- Descripción: Registra todos los intentos de acceso al sistema
-- =============================================

IF OBJECT_ID('AuditoriaAcceso', 'U') IS NOT NULL
BEGIN
    PRINT 'Eliminando tabla AuditoriaAcceso existente...';
    DROP TABLE AuditoriaAcceso;
END
GO

CREATE TABLE AuditoriaAcceso (
    AuditoriaID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NULL,
    Username NVARCHAR(50) NOT NULL,
    Accion NVARCHAR(50) NOT NULL, -- login_exitoso, login_fallido, logout, refresh_token, token_expirado
    FechaHora DATETIME2 NOT NULL DEFAULT GETDATE(),
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    Exitoso BIT NOT NULL,
    MensajeError NVARCHAR(500) NULL,
    Metadata NVARCHAR(MAX) NULL, -- JSON con info adicional
    
    CONSTRAINT FK_AuditoriaAcceso_Usuario FOREIGN KEY (UsuarioID) 
        REFERENCES Usuario(UsuarioID) ON DELETE SET NULL,
    
    CONSTRAINT CK_AuditoriaAcceso_Accion CHECK (
        Accion IN ('login_exitoso', 'login_fallido', 'logout', 'refresh_token', 
                   'token_expirado', 'token_revocado', 'cambio_password')
    ),
    
    INDEX IX_AuditoriaAcceso_Usuario (UsuarioID),
    INDEX IX_AuditoriaAcceso_Username (Username),
    INDEX IX_AuditoriaAcceso_FechaHora (FechaHora DESC),
    INDEX IX_AuditoriaAcceso_Accion (Accion),
    INDEX IX_AuditoriaAcceso_Exitoso (Exitoso),
    INDEX IX_AuditoriaAcceso_IpAddress (IpAddress)
);
GO

PRINT '✅ Tabla AuditoriaAcceso creada exitosamente';
PRINT '';

-- =============================================
-- Stored Procedures para auditoría
-- =============================================

-- Procedure: Registrar intento de acceso
IF OBJECT_ID('sp_RegistrarAcceso', 'P') IS NOT NULL
    DROP PROCEDURE sp_RegistrarAcceso;
GO

CREATE PROCEDURE sp_RegistrarAcceso
    @UsuarioID INT = NULL,
    @Username NVARCHAR(50),
    @Accion NVARCHAR(50),
    @Exitoso BIT,
    @IpAddress NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @MensajeError NVARCHAR(500) = NULL,
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO AuditoriaAcceso (
        UsuarioID, Username, Accion, Exitoso, 
        IpAddress, UserAgent, MensajeError, Metadata
    )
    VALUES (
        @UsuarioID, @Username, @Accion, @Exitoso,
        @IpAddress, @UserAgent, @MensajeError, @Metadata
    );
END
GO

PRINT '✅ Stored Procedure sp_RegistrarAcceso creado';
PRINT '';

-- Procedure: Limpiar tokens expirados
IF OBJECT_ID('sp_LimpiarTokensExpirados', 'P') IS NOT NULL
    DROP PROCEDURE sp_LimpiarTokensExpirados;
GO

CREATE PROCEDURE sp_LimpiarTokensExpirados
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Eliminados INT;
    
    DELETE FROM RefreshToken
    WHERE ExpiresAt < GETDATE() 
       OR IsRevoked = 1;
    
    SET @Eliminados = @@ROWCOUNT;
    
    PRINT 'Tokens expirados/revocados eliminados: ' + CAST(@Eliminados AS NVARCHAR(10));
    
    RETURN @Eliminados;
END
GO

PRINT '✅ Stored Procedure sp_LimpiarTokensExpirados creado';
PRINT '';

-- Procedure: Obtener historial de accesos de un usuario
IF OBJECT_ID('sp_ObtenerHistorialAccesos', 'P') IS NOT NULL
    DROP PROCEDURE sp_ObtenerHistorialAccesos;
GO

CREATE PROCEDURE sp_ObtenerHistorialAccesos
    @Username NVARCHAR(50),
    @Dias INT = 30,
    @Top INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Top)
        AuditoriaID,
        UsuarioID,
        Username,
        Accion,
        FechaHora,
        IpAddress,
        UserAgent,
        Exitoso,
        MensajeError
    FROM AuditoriaAcceso
    WHERE Username = @Username
      AND FechaHora >= DATEADD(DAY, -@Dias, GETDATE())
    ORDER BY FechaHora DESC;
END
GO

PRINT '✅ Stored Procedure sp_ObtenerHistorialAccesos creado';
PRINT '';

-- =============================================
-- Job de limpieza automática (informativo)
-- =============================================

PRINT '==============================================';
PRINT 'RECOMENDACIONES:';
PRINT '==============================================';
PRINT '1. Configurar un SQL Server Agent Job para ejecutar sp_LimpiarTokensExpirados diariamente';
PRINT '2. Configurar retención de auditoría (ej: 90 días)';
PRINT '3. Revisar periódicamente los intentos de login fallidos';
PRINT '';

-- Vista: Resumen de intentos de login fallidos recientes
IF OBJECT_ID('vw_LoginsFallidos', 'V') IS NOT NULL
    DROP VIEW vw_LoginsFallidos;
GO

CREATE VIEW vw_LoginsFallidos AS
SELECT 
    Username,
    IpAddress,
    COUNT(*) as Intentos,
    MAX(FechaHora) as UltimoIntento,
    MIN(FechaHora) as PrimerIntento
FROM AuditoriaAcceso
WHERE Accion = 'login_fallido'
  AND FechaHora >= DATEADD(HOUR, -24, GETDATE())
GROUP BY Username, IpAddress
HAVING COUNT(*) >= 3;
GO

PRINT '✅ Vista vw_LoginsFallidos creada';
PRINT '';

PRINT '==============================================';
PRINT '✅ TABLAS DE SEGURIDAD CREADAS EXITOSAMENTE';
PRINT '==============================================';
GO
