-- =============================================
-- Script: Implementar Sistema CodigoAutodata
-- Descripción: Agrega CodigoAutodata (8 dígitos) y actualiza códigos de Marca/Modelo
-- =============================================

USE Autodata;
GO

-- 1. Agregar columna CodigoAutodata en tabla Modelo
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'CodigoAutodata')
BEGIN
    ALTER TABLE Modelo
    ADD CodigoAutodata CHAR(8) NULL;
    
    PRINT 'Columna CodigoAutodata agregada a tabla Modelo';
END
ELSE
BEGIN
    PRINT 'Columna CodigoAutodata ya existe en tabla Modelo';
END
GO

-- 2. Agregar índice único en CodigoAutodata
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Modelo') AND name = 'UQ_Modelo_CodigoAutodata')
BEGIN
    CREATE UNIQUE INDEX UQ_Modelo_CodigoAutodata 
    ON Modelo(CodigoAutodata) 
    WHERE CodigoAutodata IS NOT NULL;
    
    PRINT 'Índice único creado en CodigoAutodata';
END
GO

-- 3. Modificar CodigoMarca en Marca para que sea CHAR(4) si no lo es
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Marca') AND name = 'CodigoMarca' AND max_length != 4)
BEGIN
    -- Primero crear una nueva columna temporal
    ALTER TABLE Marca ADD CodigoMarcaTmp CHAR(4) NULL;
    
    -- Actualizar con valores padded
    UPDATE Marca 
    SET CodigoMarcaTmp = RIGHT('0000' + CAST(MarcaID AS VARCHAR), 4);
    
    -- Drop la columna vieja (si no hay FK constraints)
    ALTER TABLE Marca DROP COLUMN CodigoMarca;
    
    -- Renombrar la nueva
    EXEC sp_rename 'Marca.CodigoMarcaTmp', 'CodigoMarca', 'COLUMN';
    
    -- Hacer NOT NULL
    ALTER TABLE Marca ALTER COLUMN CodigoMarca CHAR(4) NOT NULL;
    
    PRINT 'CodigoMarca actualizado a CHAR(4)';
END
GO

-- 4. Modificar CodigoModelo en Modelo para que sea CHAR(4)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'CodigoModelo')
BEGIN
    -- Crear columna temporal
    ALTER TABLE Modelo ADD CodigoModeloTmp CHAR(4) NULL;
    
    -- Actualizar con valores padded (basado en ModeloID)
    UPDATE Modelo 
    SET CodigoModeloTmp = RIGHT('0000' + CAST(ModeloID AS VARCHAR), 4);
    
    -- Drop la columna vieja
    ALTER TABLE Modelo DROP COLUMN CodigoModelo;
    
    -- Renombrar
    EXEC sp_rename 'Modelo.CodigoModeloTmp', 'CodigoModelo', 'COLUMN';
    
    -- Hacer NOT NULL
    ALTER TABLE Modelo ALTER COLUMN CodigoModelo CHAR(4) NOT NULL;
    
    PRINT 'CodigoModelo actualizado a CHAR(4)';
END
GO

-- 5. Actualizar todos los códigos de Marca existentes (padding con ceros)
UPDATE Marca 
SET CodigoMarca = RIGHT('0000' + CAST(MarcaID AS VARCHAR), 4)
WHERE LEN(CodigoMarca) != 4 OR CodigoMarca NOT LIKE '[0-9][0-9][0-9][0-9]';

PRINT 'Códigos de Marca actualizados con formato 0001, 0002, etc.';
GO

-- 6. Actualizar todos los códigos de Modelo existentes (padding con ceros)
UPDATE Modelo 
SET CodigoModelo = RIGHT('0000' + CAST(ModeloID AS VARCHAR), 4)
WHERE LEN(CodigoModelo) != 4 OR CodigoModelo NOT LIKE '[0-9][0-9][0-9][0-9]';

PRINT 'Códigos de Modelo actualizados con formato 0001, 0002, etc.';
GO

-- 7. Generar CodigoAutodata para todos los modelos existentes
UPDATE m
SET m.CodigoAutodata = ma.CodigoMarca + m.CodigoModelo
FROM Modelo m
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
WHERE m.CodigoAutodata IS NULL;

PRINT 'CodigoAutodata generado para todos los modelos existentes';
GO

-- 8. Hacer CodigoAutodata NOT NULL después de poblarlo
ALTER TABLE Modelo ALTER COLUMN CodigoAutodata CHAR(8) NOT NULL;
GO

-- 9. Verificar resultados
SELECT TOP 10
    m.ModeloID,
    ma.MarcaID,
    ma.CodigoMarca,
    m.CodigoModelo,
    m.CodigoAutodata,
    ma.Descripcion AS Marca,
    m.DescripcionModelo AS Modelo
FROM Modelo m
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
ORDER BY m.CodigoAutodata;

PRINT '';
PRINT '✅ Sistema CodigoAutodata implementado exitosamente';
PRINT 'Formato: CodigoMarca (4 dígitos) + CodigoModelo (4 dígitos) = CodigoAutodata (8 dígitos)';
PRINT 'Ejemplo: Marca 0007 + Modelo 0276 = 00070276';
GO
