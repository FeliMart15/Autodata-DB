const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 12;

async function generateCredentials() {
  console.log('='.repeat(60));
  console.log('GENERACIÓN DE CREDENCIALES SEGURAS - AUTODATA');
  console.log('='.repeat(60));
  console.log();

  // Generar JWT Secret fuerte
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
  
  console.log('📌 JWT SECRETS (Copiar a .env):');
  console.log('-'.repeat(60));
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
  console.log();

  // Usuarios y contraseñas
  const users = [
    { username: 'admin', password: 'Autodata9001_', nombre: 'Administrador del Sistema', email: 'admin@autodata.com', rol: 'admin' },
    { username: 'santiago.martinez', password: 'Santiago2024$Secure', nombre: 'Santiago Martinez', email: 'santiago.martinez@autodata.com', rol: 'admin' },
    { username: 'claudio.bustillo', password: 'Claudio2024$Secure', nombre: 'Claudio Bustillo', email: 'claudio.bustillo@autodata.com', rol: 'entrada_datos' },
    { username: 'noel.capurro', password: 'Noel2024$Secure', nombre: 'Noel Capurro', email: 'noel.capurro@autodata.com', rol: 'revision' }
  ];

  console.log('👥 USUARIOS Y CONTRASEÑAS:');
  console.log('-'.repeat(60));
  for (const user of users) {
    console.log(`Usuario: ${user.username}`);
    console.log(`Contraseña: ${user.password}`);
    console.log(`Rol: ${user.rol}`);
    console.log();
  }

  console.log('🔐 HASHES BCRYPT (Para SQL):');
  console.log('-'.repeat(60));
  console.log();
  
  const hashes = [];
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    hashes.push({ ...user, hash });
    console.log(`-- Usuario: ${user.username}`);
    console.log(`INSERT INTO Usuario (Username, Password, Nombre, Email, Rol, Activo)`);
    console.log(`VALUES (`);
    console.log(`    '${user.username}',`);
    console.log(`    '${hash}',`);
    console.log(`    '${user.nombre}',`);
    console.log(`    '${user.email}',`);
    console.log(`    '${user.rol}',`);
    console.log(`    1`);
    console.log(`);`);
    console.log();
  }

  console.log('='.repeat(60));
  console.log('✅ Generación completada');
  console.log('='.repeat(60));
  
  return { jwtSecret, jwtRefreshSecret, users: hashes };
}

generateCredentials().catch(console.error);
