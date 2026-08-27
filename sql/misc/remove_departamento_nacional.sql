-- ============================================================
-- remove_departamento_nacional.sql
-- Elimina el departamento "Nacional" (código NA), que no es un
-- departamento real de Uruguay — se había agregado por error para
-- "empadronamientos nacionales".
--
-- Seguro para re-ejecutar. Si ya hay empadronamientos cargados con
-- este departamento, el script los muestra y NO borra nada (para no
-- perder datos sin querer): hay que decidir a mano qué hacer con esos
-- registros antes de eliminar el departamento.
-- ============================================================

DECLARE @DeptoID INT = (SELECT DepartamentoID FROM Departamento WHERE Nombre = 'Nacional');

IF @DeptoID IS NULL
BEGIN
    PRINT 'El departamento "Nacional" no existe. Nada que hacer.';
END
ELSE
BEGIN
    DECLARE @Usos INT = (SELECT COUNT(*) FROM Empadronamiento WHERE DepartamentoID = @DeptoID);

    IF @Usos > 0
    BEGIN
        PRINT 'ATENCION: el departamento "Nacional" (ID ' + CAST(@DeptoID AS VARCHAR) + ') tiene '
            + CAST(@Usos AS VARCHAR) + ' empadronamiento(s) cargado(s). NO se elimina automáticamente.';
        PRINT 'Revisá esos registros (tabla Empadronamiento WHERE DepartamentoID = ' + CAST(@DeptoID AS VARCHAR) + ') antes de decidir qué hacer.';
    END
    ELSE
    BEGIN
        DELETE FROM Departamento WHERE DepartamentoID = @DeptoID;
        PRINT 'Departamento "Nacional" (ID ' + CAST(@DeptoID AS VARCHAR) + ') eliminado.';
    END
END
