-- ============================================================
-- fix_familia_id_modelos.sql
-- Sincroniza FamiliaID para modelos importados via importarExcelAutos
-- que tienen Familia (texto) pero FamiliaID = NULL.
--
-- Ejecutar una sola vez en produccion despues de deployar el fix
-- del importController. Seguro para re-ejecutar (solo actua sobre
-- filas con FamiliaID IS NULL).
-- ============================================================

-- PASO 1: Crear registros en tabla Familia para familias que no existen todavia
INSERT INTO Familia (MarcaID, Nombre, Activo, FechaCreacion)
SELECT DISTINCT m.MarcaID, LTRIM(RTRIM(m.Familia)), 1, GETDATE()
FROM Modelo m
WHERE m.Familia IS NOT NULL
  AND LTRIM(RTRIM(m.Familia)) <> ''
  AND m.FamiliaID IS NULL
  AND m.Activo = 1
  AND NOT EXISTS (
    SELECT 1 FROM Familia f
    WHERE f.MarcaID = m.MarcaID
      AND LTRIM(RTRIM(f.Nombre)) COLLATE Latin1_General_CI_AI
        = LTRIM(RTRIM(m.Familia))   COLLATE Latin1_General_CI_AI
  );

-- PASO 2: Vincular los modelos a su Familia (ahora ya existe el registro)
UPDATE m
SET m.FamiliaID = f.FamiliaID
FROM Modelo m
INNER JOIN Familia f
  ON f.MarcaID = m.MarcaID
 AND LTRIM(RTRIM(f.Nombre)) COLLATE Latin1_General_CI_AI
   = LTRIM(RTRIM(m.Familia)) COLLATE Latin1_General_CI_AI
WHERE m.FamiliaID IS NULL
  AND m.Familia IS NOT NULL
  AND LTRIM(RTRIM(m.Familia)) <> ''
  AND m.Activo = 1;

-- VERIFICACION: mostrar cuantos modelos quedaron sin FamiliaID (deberia ser 0 para los que tienen Familia texto)
SELECT
  COUNT(*) AS modelos_sin_familiaID_con_familia_texto
FROM Modelo
WHERE FamiliaID IS NULL
  AND Familia IS NOT NULL
  AND LTRIM(RTRIM(Familia)) <> ''
  AND Activo = 1;
