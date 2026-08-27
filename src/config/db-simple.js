require('dotenv').config();
const sql = require('msnodesqlv8');

const connectionString = "Server=localhost\\SQLEXPRESS;Database=Autodata;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

// Pool de conexiones con helpers
const db = {
  // Query con callback
  query: (queryString, callback) => {
    sql.query(connectionString, queryString, callback);
  },
  
  // Query con Promise
  queryRaw: (queryString) => {
    return new Promise((resolve, reject) => {
      sql.query(connectionString, queryString, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Query con parámetros (reemplaza @p0, @p1, etc con valores)
  queryWithParams: async (queryString, params = []) => {
    // Reemplazar parámetros @p0, @p1, etc con valores escapados
    let processedQuery = queryString;
    params.forEach((param, index) => {
      const placeholder = `@p${index}`;
      let value;
      
      if (param === null || param === undefined) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        // Escapar comillas simples
        value = `N'${param.replace(/'/g, "''")}'`;
      } else if (typeof param === 'number') {
        value = Number.isFinite(param) ? param.toString() : 'NULL';
      } else if (typeof param === 'boolean') {
        value = param ? '1' : '0';
      } else if (param instanceof Date) {
        value = `'${param.toISOString()}'`;
      } else {
        value = `N'${JSON.stringify(param).replace(/'/g, "''")}'`;
      }
      
      processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return db.queryRaw(processedQuery);
  },

  // Query con parámetros nombrados (más seguro y legible)
  query: async (queryString, params = {}) => {
    let processedQuery = queryString;
    
    // Reemplazar parámetros nombrados @nombre con valores escapados
    for (const [key, param] of Object.entries(params)) {
      const placeholder = `@${key}`;
      let value;
      
      if (param === null || param === undefined) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        // Escapar comillas simples
        value = `N'${param.replace(/'/g, "''")}'`;
      } else if (typeof param === 'number') {
        value = Number.isFinite(param) ? param.toString() : 'NULL';
      } else if (typeof param === 'boolean') {
        value = param ? '1' : '0';
      } else if (param instanceof Date) {
        value = `'${param.toISOString()}'`;
      } else {
        value = `N'${JSON.stringify(param).replace(/'/g, "''")}'`;
      }
      
      // Usar una expresión regular con límites de palabra para reemplazar solo parámetros completos
      const regex = new RegExp(`${placeholder}(?![a-zA-Z0-9_])`, 'g');
      processedQuery = processedQuery.replace(regex, value);
    }
    
    return db.queryRaw(processedQuery);
  },

  // Helper para SELECT (retorna array de objetos)
  select: async (table, where = '', orderBy = '') => {
    let query = `SELECT * FROM ${table}`;
    if (where) query += ` WHERE ${where}`;
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    return db.queryRaw(query);
  },

  // Helper para SELECT con campos específicos
  selectFields: async (table, fields, where = '', orderBy = '') => {
    let query = `SELECT ${fields} FROM ${table}`;
    if (where) query += ` WHERE ${where}`;
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    return db.queryRaw(query);
  },

  // Helper para SELECT con paginación
  selectPaginated: async (table, page = 1, limit = 50, where = '', orderBy = '') => {
    const offset = (page - 1) * limit;
    let countQuery = `SELECT COUNT(*) as total FROM ${table}`;
    if (where) countQuery += ` WHERE ${where}`;
    
    let dataQuery = `SELECT * FROM ${table}`;
    if (where) dataQuery += ` WHERE ${where}`;
    if (orderBy) dataQuery += ` ORDER BY ${orderBy}`;
    dataQuery += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    
    const [countResult, data] = await Promise.all([
      db.queryRaw(countQuery),
      db.queryRaw(dataQuery)
    ]);
    
    return {
      data,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(countResult[0].total / limit)
    };
  },

  // Helper para SELECT by ID
  findById: async (table, idField, id) => {
    const query = `SELECT * FROM ${table} WHERE ${idField} = ${id}`;
    const result = await db.queryRaw(query);
    return result[0] || null;
  },

  // Helper para INSERT
  insert: async (table, data) => {
    // Escapar nombres de columnas con corchetes para evitar conflictos con palabras reservadas
    const fields = Object.keys(data).map(f => `[${f}]`).join(', ');
    const values = Object.values(data).map(v => {
      if (v === null || v === undefined) return 'NULL';
      if (v === true) return '1';
      if (v === false) return '0';
      if (v instanceof Date) return `'${v.toISOString()}'`;
      if (typeof v === 'string') return `N'${v.replace(/'/g, "''")}'`;
      return v;
    }).join(', ');
    
    const query = `INSERT INTO ${table} (${fields}) OUTPUT INSERTED.* VALUES (${values})`;
    const result = await db.queryRaw(query);
    return result[0];
  },

  // Helper para UPDATE
  update: async (table, idField, id, data) => {
    const sets = Object.keys(data).map(key => {
      const value = data[key];
      const sqlValue = typeof value === 'string' ? `N'${value.replace(/'/g, "''")}'` :
        value === null ? 'NULL' :
        value === true ? '1' :
        value === false ? '0' : value;
      return `[${key}] = ${sqlValue}`;
    }).join(', ');
    
    const query = `UPDATE ${table} SET ${sets} OUTPUT INSERTED.* WHERE [${idField}] = ${id}`;
    const result = await db.queryRaw(query);
    return result[0] || null;
  },

  // Helper para DELETE
  delete: async (table, idField, id) => {
    const query = `DELETE FROM ${table} WHERE ${idField} = ${id}`;
    await db.queryRaw(query);
    return true;
  },

  // Ejecuta múltiples queries secuencialmente en UNA SOLA conexión persistente.
  // Necesario para operaciones que dependen de estado de sesión como SET IDENTITY_INSERT.
  // Devuelve array de resultados, uno por query.
  querySequentialOnSingleConn: (queries) => {
    return new Promise((resolve, reject) => {
      sql.open(connectionString, (openErr, conn) => {
        if (openErr) return reject(openErr);

        const results = [];
        const runNext = (i) => {
          if (i >= queries.length) {
            conn.close();
            return resolve(results);
          }
          conn.query(queries[i], (err, rows) => {
            if (err) {
              conn.close();
              return reject(err);
            }
            results.push(rows || []);
            runNext(i + 1);
          });
        };
        runNext(0);
      });
    });
  },

  close: () => {
    console.log('Connection pool closed');
  }
};

module.exports = db;
