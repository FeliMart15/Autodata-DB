-- =============================================
-- Script: Seed Usuario Administrador
-- Descripción: Inserta usuario admin inicial del sistema
-- Fecha: 10 de Diciembre, 2025
-- =============================================

USE Autodata;
GO

PRINT 'Insertando usuario administrador...';
GO

-- Verificar si ya existe un usuario admin
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username = 'admin')
BEGIN
    -- Hash bcrypt de la contraseña "admin123"
    -- Generado con bcrypt rounds=10
    -- En producción, este hash debería generarse por el backend
    DECLARE @PasswordHash NVARCHAR(255) = '$2b$10$YourBcryptHashHere';
    
    INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
    VALUES (
        'admin',
        @PasswordHash,
        'Administrador del Sistema',
        'admin@autodata.com',
        'admin',
        1
    );
    
    PRINT 'Usuario administrador creado exitosamente';
    PRINT '';
    PRINT '==============================================';
    PRINT 'Credenciales de acceso:';
    PRINT '  Usuario: admin';
    PRINT '  Contraseña: admin123';
    PRINT '  Rol: admin';
    PRINT '==============================================';
    PRINT '';
    PRINT 'IMPORTANTE: Cambiar la contraseña después del primer login';
END
ELSE
BEGIN
    PRINT 'Usuario admin ya existe en la base de datos';
    
    SELECT 
        UsuarioID,
        Username,
        Nombre,
        Email,
        Rol,
        Activo,
        FechaCreacion
    FROM Usuario
    WHERE Username = 'admin';
END
GO

-- Insertar usuarios de ejemplo para testing (opcional)
PRINT '';
PRINT 'Insertando usuarios de prueba...';
GO

-- Usuario de Entrada de Datos
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username = 'entrada1')
BEGIN
    INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
    VALUES (
        'entrada1',
        '$2b$10$YourBcryptHashHere',
        'Juan Pérez',
        'juan.perez@autodata.com',
        'entrada_datos',
        1
    );
    PRINT 'Usuario entrada1 creado';
END

-- Usuario de Revisión
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username = 'revision1')
BEGIN
    INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
    VALUES (
        'revision1',
        '$2b$10$YourBcryptHashHere',
        'María García',
        'maria.garcia@autodata.com',
        'revision',
        1
    );
    PRINT 'Usuario revision1 creado';
END

-- Usuario de Aprobación
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username = 'aprobacion1')
BEGIN
    INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
    VALUES (
        'aprobacion1',
        '$2b$10$YourBcryptHashHere',
        'Carlos Rodríguez',
        'carlos.rodriguez@autodata.com',
        'aprobacion',
        1
    );
    PRINT 'Usuario aprobacion1 creado';
END

GO

PRINT '';
PRINT '==============================================';
PRINT 'NOTA IMPORTANTE:';
PRINT 'Los hashes de contraseña en este script son placeholders.';
PRINT 'El sistema usará la lógica de usuario temporal en authController';
PRINT 'hasta que actualices los hashes reales desde el backend.';
PRINT '';
PRINT 'Usuarios de prueba (todos con contraseña: admin123):';
PRINT '  - admin (rol: admin)';
PRINT '  - entrada1 (rol: entrada_datos)';
PRINT '  - revision1 (rol: revision)';
PRINT '  - aprobacion1 (rol: aprobacion)';
PRINT '==============================================';
GO

-- Mostrar todos los usuarios creados
PRINT '';
PRINT 'Usuarios en el sistema:';
SELECT 
    UsuarioID,
    Username,
    Nombre,
    Email,
    Rol,
    Activo,
    FechaCreacion
FROM Usuario
ORDER BY UsuarioID;
GO
