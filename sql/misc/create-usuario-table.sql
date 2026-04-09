-- Crear tabla Usuario
IF OBJECT_ID('Usuario', 'U') IS NOT NULL
    DROP TABLE Usuario;
GO

CREATE TABLE Usuario (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL, -- Bcrypt hash
    Nombre NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Rol NVARCHAR(50) NOT NULL, -- admin, aprobacion, revision, entrada_datos
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaUltimoAcceso DATETIME2,
    
    CONSTRAINT CK_Usuario_Rol CHECK (Rol IN ('admin', 'aprobacion', 'revision', 'entrada_datos')),
    INDEX IX_Usuario_Username (Username),
    INDEX IX_Usuario_Email (Email),
    INDEX IX_Usuario_Rol (Rol)
);
GO

PRINT 'Tabla Usuario creada exitosamente';
