-- ============================================================
-- asiento_electrico_calef_masaje_a_texto.sql
-- Convierte EquipamientoModelo.AsientoElectricoCalefMasaje de BIT a
-- NVARCHAR(20), para pasar de un simple Si/No a un desplegable con
-- 4 opciones: "Si", "No", "Elect. + Calef", "Calef".
--
-- Los valores existentes se migran preservando su significado:
--   1 (true)  -> 'Si'
--   0 (false) -> 'No'
--   NULL      -> NULL
-- No hay forma de inferir retroactivamente si un auto marcado "Si"
-- corresponde específicamente a "Elect. + Calef" o "Calef" (el BIT
-- original no distinguía eso); esos casos quedan en "Si" genérico y
-- se pueden precisar manualmente si hace falta.
--
-- Seguro para re-ejecutar (no hace nada si la columna ya es texto).
-- No hace falta resetear la base para aplicar este cambio.
-- Requiere ejecutarse en batches separados por GO (ALTER TABLE ADD
-- COLUMN y su uso posterior no pueden ir en el mismo batch).
-- ============================================================

IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'EquipamientoModelo'
      AND COLUMN_NAME = 'AsientoElectricoCalefMasaje'
      AND DATA_TYPE = 'bit'
)
BEGIN
    ALTER TABLE dbo.EquipamientoModelo ADD AsientoElectricoCalefMasaje_new NVARCHAR(20) NULL;
END
GO

-- SQL dinamico: si no lo envolvemos en EXEC(), SQL Server intenta resolver
-- la columna "_new" al COMPILAR este batch (aunque el IF de runtime la
-- salte), y una segunda corrida (donde la columna ya no existe porque el
-- batch anterior la renombro) falla con "Invalid column name" antes de
-- llegar a evaluar el IF.
IF COL_LENGTH('dbo.EquipamientoModelo', 'AsientoElectricoCalefMasaje_new') IS NOT NULL
BEGIN
    EXEC('
        UPDATE dbo.EquipamientoModelo
        SET AsientoElectricoCalefMasaje_new = CASE
            WHEN AsientoElectricoCalefMasaje = 1 THEN ''Si''
            WHEN AsientoElectricoCalefMasaje = 0 THEN ''No''
            ELSE NULL
        END;

        ALTER TABLE dbo.EquipamientoModelo DROP COLUMN AsientoElectricoCalefMasaje;
    ');
END
GO

IF COL_LENGTH('dbo.EquipamientoModelo', 'AsientoElectricoCalefMasaje_new') IS NOT NULL
BEGIN
    EXEC sp_rename 'dbo.EquipamientoModelo.AsientoElectricoCalefMasaje_new', 'AsientoElectricoCalefMasaje', 'COLUMN';
    PRINT 'AsientoElectricoCalefMasaje convertida de BIT a NVARCHAR(20) (1->Si, 0->No, NULL->NULL).';
END
ELSE
    PRINT 'AsientoElectricoCalefMasaje ya no es BIT, no se modifica.';
GO
