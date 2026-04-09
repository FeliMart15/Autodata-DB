// Script para generar hashes de contraseñas con bcrypt
const bcrypt = require('bcrypt');

const usuarios = [
  {
    username: 'santiago.martinez',
    password: 'Admin2024!',
    nombre: 'Santiago Martínez',
    email: 'santiago.martinez@autodata.com',
    rol: 'admin'
  },
  {
    username: 'claudio.bustillo',
    password: 'Aprobador2024!',
    nombre: 'Claudio Bustillo',
    email: 'claudio.bustillo@autodata.com',
    rol: 'aprobacion'
  },
  {
    username: 'yanina.dotti',
    password: 'Revisor2024!',
    nombre: 'Yanina Dotti',
    email: 'yanina.dotti@autodata.com',
    rol: 'revision'
  },
  {
    username: 'noel.capurro',
    password: 'Entrada2024!',
    nombre: 'Noel Capurro',
    email: 'noel.capurro@autodata.com',
    rol: 'entrada_datos'
  }
];

async function generateHashes() {
  console.log('-- Script SQL de Seed para Usuarios\n');
  console.log('-- Contraseñas generadas:');
  
  for (const user of usuarios) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`-- ${user.username}: ${user.password}`);
    console.log(`INSERT INTO Usuario (Username, Password, Nombre, Email, Rol) VALUES ('${user.username}', '${hash}', N'${user.nombre}', '${user.email}', '${user.rol}');\n`);
  }
  
  console.log('\nGO\nPRINT \'Usuarios creados exitosamente\';');
}

generateHashes().catch(console.error);
