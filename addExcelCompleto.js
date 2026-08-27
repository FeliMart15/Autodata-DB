const fs = require('fs');
const filepath = 'src/controllers/importController.js';
let content = fs.readFileSync(filepath, 'utf-8');

// Replace the export block to include the new functions
const newExport = `

const descargarTemplateCompleto = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../data/Plantilla Maestra.xlsx');
    
    if (fs.existsSync(filePath)) {
      return res.download(filePath, 'Plantilla_Maestra.xlsx');
    } else {
      return res.status(404).json({ success: false, message: 'La plantilla no existe en el servidor.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al descargar plantilla: ' + error.message });
  }
};

const importarExcelCompleto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo no proporcionado.' });

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

    const creados = { marcas: 0, modelos: 0, equipamiento_inserts: 0, equipamiento_updates: 0 };
    const usuarioId = req.user?.id || 1;

    // Obtener los nombres de columnas vÃ¡lidas de la tabla EquipamientoModelo
    const columnsQuery = await db.queryRaw("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'EquipamientoModelo' AND COLUMN_NAME NOT IN ('EquipamientoID', 'ModeloID')");
    const validEquipCols = columnsQuery.map(c => c.COLUMN_NAME);

    // Mapeo en memoria
    const marcaIdMap = new Map();

    for (const row of data) {
      // Leer campos principales
      const mCodStr = row['Codigo_Marca'] || row['CodigoMarca'];
      if (!mCodStr) continue;
      const codMarca = String(mCodStr).trim().padStart(4, '0');
      const marcaDesc = row['Marca'] ? String(row['Marca']).trim() : '';
      
      const pCodStr = row['Codigo_Modelo'] || row['CodigoModelo'];
      const codModelo = pCodStr ? String(pCodStr).trim().padStart(4, '0') : '';
      const modeloDesc = row['Descripcion_Modelo'] ? String(row['Descripcion_Modelo']).trim() : '';
      const familiaDesc = row['Familia'] ? String(row['Familia']).trim() : null;
      const combustible = row['Combustible'] ? String(row['Combustible']).trim() : null;
      const categoria = row['Categoria'] ? String(row['Categoria']).trim() : null;
      
      // Limpiar precio USD
      let precio = row['Precio_USD'];
      if (typeof precio === 'string') {
        const pClean = parseFloat(precio.replace(/[^\\d.-]/g, ''));
        precio = isNaN(pClean) ? null : pClean;
      }
      
      let codigoAutodata = row['CODCONCATENADO'] || row['CODIGO CONCATENADO'];
      if (!codigoAutodata) {
        codigoAutodata = \`\${codMarca}\${codModelo}\`;
      }
      
      // 1. Marca
      if (!marcaIdMap.has(codMarca)) {
        let dbMarca = await db.queryWithParams('SELECT MarcaID FROM Marca WHERE CodigoMarca = @p0', [codMarca]);
        if (dbMarca.length === 0) {
          const mInsert = await db.queryRaw(\`INSERT INTO Marca (Descripcion, CodigoMarca) OUTPUT INSERTED.MarcaID VALUES (N'\${marcaDesc.replace(/'/g, "''")}', '\${codMarca}')\`);
          if (mInsert && mInsert.length > 0) {
            marcaIdMap.set(codMarca, mInsert[0].MarcaID);
            creados.marcas++;
          }
        } else {
          marcaIdMap.set(codMarca, dbMarca[0].MarcaID);
        }
      }
      const dbMarcaId = marcaIdMap.get(codMarca);
      if (!dbMarcaId) continue; // safety

      // 2. Modelo
      const modExists = await db.queryWithParams(\`SELECT ModeloID FROM Modelo WHERE CodigoAutodata = @p0 OR (MarcaID = @p1 AND CodigoModelo = @p2)\`, [codigoAutodata, dbMarcaId, codModelo]);
      let modeloIdDb = null;
      
      if (modExists.length === 0) {
        const insertMod = await db.queryWithParams(
          \`INSERT INTO Modelo (MarcaID, CodigoModelo, CodigoAutodata, DescripcionModelo, Familia, CombustibleCodigo, CategoriaCodigo, Estado, Activo, ModificadoPorID, PrecioInicial) 
           OUTPUT INSERTED.ModeloID 
           VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, 'importado', 1, @p7, @p8)\`, 
          [dbMarcaId, codModelo, codigoAutodata, modeloDesc, familiaDesc, combustible, categoria, usuarioId, precio]
        );
        if (insertMod && insertMod.length > 0) {
          modeloIdDb = insertMod[0].ModeloID;
          await db.queryWithParams(\`INSERT INTO ModeloHistorial (ModeloID, Campo, ValorAnterior, ValorNuevo, Usuario) VALUES (@p0, 'Estado', NULL, 'importado', 'Sistema')\`, [modeloIdDb]);
          creados.modelos++;
        }
      } else {
        modeloIdDb = modExists[0].ModeloID;
        // Optionally update existing model basics if wanted (not strictly required if it just matches, but updates are welcome)
        await db.queryWithParams(
            \`UPDATE Modelo SET DescripcionModelo = @p0, Familia = @p1, CombustibleCodigo = @p2, CategoriaCodigo = @p3 WHERE ModeloID = @p4\`,
            [modeloDesc, familiaDesc, combustible, categoria, modeloIdDb]
        );
      }

      if (!modeloIdDb) continue;

      // 3. Precio
      if (precio != null && !isNaN(precio)) {
         await db.queryWithParams(\`UPDATE Modelo SET PrecioInicial = @p0 WHERE ModeloID = @p1\`, [precio, modeloIdDb]);
         await db.queryWithParams(\`INSERT INTO PrecioModelo (ModeloID, Precio, Moneda, FechaVigenciaDesde, Fuente, FechaCarga) VALUES (@p0, @p1, 'USD', GETDATE(), 'Plantilla Maestra', GETDATE())\`, [modeloIdDb, precio]);
      }

      // 4. Equipamiento
      // Filtrar columnas de row que coincidan con validEquipCols (haciendo match exacto omitiendo case y espacios quiza? No, las keys del json las hizo xlsx y coinciden con las de EquipamientoModelo en DB en esta plantilla)
      const updateObj = {};
      for (const colName of validEquipCols) {
        if (row[colName] !== undefined) {
           let val = row[colName];
           // Convert "Si"/"SÃ"/"S"/"1"/true to boolean true if needed, or leave to sql
           if (typeof val === 'string' && (val.toLowerCase().trim() === 'si' || val.toLowerCase().trim() === 'sÃ' || val.toLowerCase().trim() === 's')) val = true;
           if (typeof val === 'string' && (val.toLowerCase().trim() === 'no' || val.toLowerCase().trim() === 'n')) val = false;
           updateObj[colName] = val;
        }
      }

      const eqKeys = Object.keys(updateObj);
      if (eqKeys.length > 0) {
        const eqExists = await db.queryWithParams(\`SELECT EquipamientoID FROM EquipamientoModelo WHERE ModeloID = @p0\`, [modeloIdDb]);
        
        if (eqExists.length > 0) {
          // Update
          const setters = eqKeys.map((k, i) => \`[\${k}] = @p\${i + 1}\`).join(', ');
          const values = eqKeys.map(k => updateObj[k]);
          await db.queryWithParams(\`UPDATE EquipamientoModelo SET \${setters} WHERE ModeloID = @p0\`, [modeloIdDb, ...values]);
          creados.equipamiento_updates++;
        } else {
          // Insert
          const cols = eqKeys.map(k => \`[\${k}]\`).join(', ');
          const paramsList = eqKeys.map((_, i) => \`@p\${i + 1}\`).join(', ');
          const values = eqKeys.map(k => updateObj[k]);
          await db.queryWithParams(
            \`INSERT INTO EquipamientoModelo (ModeloID, \${cols}) VALUES (@p0, \${paramsList})\`,
            [modeloIdDb, ...values]
          );
          creados.equipamiento_inserts++;
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Archivo procesado con Ã©xito', creados });
  } catch (error) {
    logger.error('Error procesando plantilla:', error);
    return res.status(500).json({ success: false, message: 'Error en la importaciÃ³n: ' + error.message });
  }
};

module.exports = {
  upload,
  importarExcelAutos,
  importarExcelPrecios,
  importarCSV,
  importarExcelCompleto,
  descargarTemplateCompleto,
  listarBatches,
  obtenerBatch,
  procesarBatch,
  eliminarBatch
};
`;

content = content.replace(/module\.exports\s*=\s*{[\s\S]*?};/, newExport);

fs.writeFileSync(filepath, content, 'utf-8');
console.log('Successfully injected methods into importController');
