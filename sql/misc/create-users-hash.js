/**
 * Script para crear usuarios con hash bcrypt
 * Ejecutar: node sql/create-users-hash.js
 */

const bcrypt = require('bcrypt');
const sql = require('msnodesqlv8');

const connectionString = "Server=localhost\\SQLEXPRESS;Database=Autodata;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const usuarios = [
  {
    username: 'admin',
    password: 'admin123',
    nombre: 'Administrador del Sistema',
    email: 'admin@autodata.com',
    rol: 'admin'
  },
  {
    username: 'entrada1',
    password: 'admin123',
    nombre: 'Juan Pérez',
    email: 'juan.perez@autodata.com',
    rol: 'entrada_datos'
  },
  {
    username: 'revision1',
    password: 'admin123',
    nombre: 'María García',
    email: 'maria.garcia@autodata.com',
    rol: 'revision'
  },
  {
    username: 'aprobacion1',
    password: 'admin123',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@autodata.com',
    rol: 'aprobacion'
  }
];

function queryPromise(queryString) {
  return new Promise((resolve, reject) => {
    sql.query(connectionString, queryString, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function crearUsuarios() {
  try {
    console.log('Conectando a la base de datos...');
    // Test connection
    await queryPromise('SELECT 1 AS test');
    console.log('✓ Conexión exitosa\n');

    for (const usuario of usuarios) {
      // Verificar si el usuario ya existe
      const checkQuery = `SELECT UsuarioID FROM Usuario WHERE Username = N'${usuario.username}'`;
      const checkResult = await queryPromise(checkQuery);

      if (checkResult.length > 0) {
        console.log(`⚠ Usuario '${usuario.username}' ya existe, saltando...`);
        continue;
      }

      // Generar hash de la contraseña
      console.log(`Generando hash para usuario '${usuario.username}'...`);
      const hashedPassword = await bcrypt.hash(usuario.password, 10);

      // Insertar usuario
      const insertQuery = `
        INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)
        VALUES (
          N'${usuario.username}',
          N'${hashedPassword}',
          N'${usuario.nombre}',
          N'${usuario.email}',
          N'${usuario.rol}',
          1
        )
      `;
      await queryPromise(insertQuery);

      console.log(`✓ Usuario '${usuario.username}' creado exitosamente`);
    }

    console.log('\n==============================================');
    console.log('Usuarios creados exitosamente');
    console.log('==============================================\n');

    // Mostrar usuarios creados
    const result = await queryPromise(`
      SELECT UsuarioID, Username, Nombre, Email, Rol, Activo, FechaCreacion
      FROM Usuario
      ORDER BY UsuarioID
    `);

    console.log('Usuarios en el sistema:');
    console.table(result);

    console.log('\n==============================================');
    console.log('Credenciales de acceso:');
    console.log('==============================================');
    usuarios.forEach(u => {
      console.log(`\n${u.nombre}`);
      console.log(`  Usuario: ${u.username}`);
      console.log(`  Contraseña: ${u.password}`);
      console.log(`  Rol: ${u.rol}`);
    });
    console.log('\n==============================================');
    console.log('IMPORTANTE: Cambiar contraseñas en producción');
    console.log('==============================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar
crearUsuarios()
  .then(() => {
    console.log('Script completado');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
