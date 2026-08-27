-- ============================================================
-- add_precio_congelado_ventas_empadronamientos.sql
-- Agrega la columna PrecioUnitario a Venta y Empadronamiento para
-- congelar el precio del modelo al momento de cargar cada registro.
--
-- Antes de este cambio, el precio se calculaba "en vivo" contra el
-- precio ACTUAL del modelo (m.PrecioInicial / PrecioModelo), por lo
-- que exportar ventas viejas mostraba el precio de HOY, no el que
-- tenía el auto cuando se cargó esa venta.
--
-- Seguro para re-ejecutar (solo agrega la columna si no existe).
-- No hace falta resetear la base para aplicar este cambio.
-- ============================================================

IF COL_LENGTH('dbo.Venta', 'PrecioUnitario') IS NULL
BEGIN
    ALTER TABLE dbo.Venta ADD PrecioUnitario DECIMAL(18,2) NULL;
    PRINT 'Columna PrecioUnitario agregada a Venta.';
END
ELSE
    PRINT 'Venta.PrecioUnitario ya existía, no se modifica.';

IF COL_LENGTH('dbo.Empadronamiento', 'PrecioUnitario') IS NULL
BEGIN
    ALTER TABLE dbo.Empadronamiento ADD PrecioUnitario DECIMAL(18,2) NULL;
    PRINT 'Columna PrecioUnitario agregada a Empadronamiento.';
END
ELSE
    PRINT 'Empadronamiento.PrecioUnitario ya existía, no se modifica.';

-- NOTA: los registros ya existentes quedan con PrecioUnitario = NULL
-- (no se puede reconstruir retroactivamente qué precio tenía el auto
-- en ese momento). El export usa COALESCE(PrecioUnitario, PrecioInicial actual)
-- como fallback para esos registros viejos.
