-- =============================================
-- Script: Seed Usuarios Seguros
-- Descripción: Inserta usuarios del sistema con contraseñas reales hasheadas
-- Fecha: 1 de Febrero, 2026
-- =============================================

USE Autodata;
GO

PRINT '==============================================';
PRINT 'SEED DE USUARIOS - SISTEMA AUTODATA';
PRINT '==============================================';
PRINT '';

-- Limpiar usuarios existentes (solo en desarrollo)
IF EXISTS (SELECT 1 FROM Usuario)
BEGIN
    PRINT '⚠️  ADVERTENCIA: Eliminando usuarios existentes...';
    DELETE FROM Usuario;
    DBCC CHECKIDENT ('Usuario', RESEED, 0);
    PRINT '';
END

-- Usuario: admin
-- Contraseña: Autodata9001_
-- Rol: admin
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
VALUES (
    'admin',
    '$2b$12$Etn1aE0bxI9jxqgVz6yqoen.i.VpaMM5qCPaAcMVxrZcVLReN6mIS',
    'Administrador del Sistema',
    'admin@autodata.com',
    'admin',
    1
);
PRINT '✅ Usuario admin creado';

-- Usuario: santiago.martinez
-- Contraseña: Santiago2024$Secure
-- Rol: admin
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
VALUES (
    'santiago.martinez',
    '$2b$12$.V01iroM2khTH3TgQn4VVOu1WW2oKPKcUdK.C1WzSo15Tx.MppYdm',
    'Santiago Martinez',
    'santiago.martinez@autodata.com',
    'admin',
    1
);
PRINT '✅ Usuario santiago.martinez creado';

-- Usuario: claudio.bustillo
-- Contraseña: Claudio2024$Secure
-- Rol: entrada_datos
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
VALUES (
    'claudio.bustillo',
    '$2b$12$ttv.PGb9jDJjfIqVdkievOwRILMUXOTOglzZK8IrcpkZDKqHp34cK',
    'Claudio Bustillo',
    'claudio.bustillo@autodata.com',
    'entrada_datos',
    1
);
PRINT '✅ Usuario claudio.bustillo creado';

-- Usuario: noel.capurro
-- Contraseña: Noel2024$Secure
-- Rol: revision
INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
VALUES (
    'noel.capurro',
    '$2b$12$N/FPtY/iXR7aaSNrmM5zFeUHLk4n35t5st4dFlNhenWq3fK6qaWtK',
    'Noel Capurro',
    'noel.capurro@autodata.com',
    'revision',
    1
);
PRINT '✅ Usuario noel.capurro creado';

PRINT '';
PRINT '==============================================';
PRINT 'CREDENCIALES DE ACCESO';
PRINT '==============================================';
PRINT '';
PRINT '👤 Admin:';
PRINT '   Usuario: admin';
PRINT '   Contraseña: Autodata9001_';
PRINT '   Rol: admin';
PRINT '';
PRINT '👤 Santiago Martinez:';
PRINT '   Usuario: santiago.martinez';
PRINT '   Contraseña: Santiago2024$Secure';
PRINT '   Rol: admin';
PRINT '';
PRINT '👤 Claudio Bustillo:';
PRINT '   Usuario: claudio.bustillo';
PRINT '   Contraseña: Claudio2024$Secure';
PRINT '   Rol: entrada_datos';
PRINT '';
PRINT '👤 Noel Capurro:';
PRINT '   Usuario: noel.capurro';
PRINT '   Contraseña: Noel2024$Secure';
PRINT '   Rol: revision';
PRINT '';
PRINT '==============================================';

-- Mostrar usuarios creados
PRINT '';
PRINT 'USUARIOS EN EL SISTEMA:';
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

PRINT '';
PRINT '==============================================';
PRINT '✅ SEED DE USUARIOS COMPLETADO';
PRINT '==============================================';
GO
