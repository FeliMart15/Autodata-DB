const http = require('http');

const API_URL = 'http://localhost:3000/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Helper para hacer requests HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Usuarios de prueba
const usuarios = [
  { username: 'admin', password: 'Autodata9001_', nombre: 'Admin' },
  { username: 'santiago.martinez', password: 'Santiago2024$Secure', nombre: 'Santiago' },
  { username: 'claudio.bustillo', password: 'Claudio2024$Secure', nombre: 'Claudio' },
  { username: 'noel.capurro', password: 'Noel2024$Secure', nombre: 'Noel' },
];

async function probarLogin(username, password, nombre) {
  try {
    log.info(`Probando login: ${nombre} (${username})`);
    
    const response = await makeRequest('POST', '/auth/login', {
      username,
      password
    });

    if (response.status === 200 && response.data.success) {
      log.success(`Login exitoso para ${nombre}`);
      console.log(`  - Token recibido: ${response.data.token.substring(0, 20)}...`);
      console.log(`  - Refresh token: ${response.data.refreshToken.substring(0, 20)}...`);
      console.log(`  - Rol: ${response.data.user.rol}`);
      console.log(`  - Email: ${response.data.user.email}`);
      
      // Probar endpoint /me
      const meResponse = await makeRequest('GET', '/auth/me', null, {
        Authorization: `Bearer ${response.data.token}`
      });
      
      if (meResponse.status === 200 && meResponse.data.success) {
        log.success(`Endpoint /me funciona para ${nombre}`);
      }
      
      // Probar refresh token
      const refreshResponse = await makeRequest('POST', '/auth/refresh', {
        refreshToken: response.data.refreshToken
      });
      
      if (refreshResponse.status === 200 && refreshResponse.data.success) {
        log.success(`Refresh token funciona para ${nombre}`);
        console.log(`  - Nuevo token recibido`);
      }
      
      // Probar logout
      const logoutResponse = await makeRequest('POST', '/auth/logout', 
        { refreshToken: response.data.refreshToken },
        { Authorization: `Bearer ${response.data.token}` }
      );
      
      if (logoutResponse.status === 200 && logoutResponse.data.success) {
        log.success(`Logout funciona para ${nombre}`);
      }
      
      console.log('');
      return true;
    } else {
      log.error(`Login falló para ${nombre}: ${response.data.message}`);
      console.log('');
      return false;
    }
  } catch (error) {
    log.error(`Error en login de ${nombre}: ${error.message}`);
    console.log('');
    return false;
  }
}

async function probarCredencialesInvalidas() {
  try {
    log.info('Probando credenciales inválidas (debe fallar)');
    
    const response = await makeRequest('POST', '/auth/login', {
      username: 'admin',
      password: 'contraseña_incorrecta'
    });
    
    if (response.status === 401) {
      log.success('Protección correcta: Rechazó contraseña incorrecta');
    } else {
      log.error('¡ERROR! Login exitoso con contraseña incorrecta');
    }
  } catch (error) {
    log.success('Protección correcta: Rechazó contraseña incorrecta');
  }
  console.log('');
}

async function probarRateLimiting() {
  try {
    log.info('Probando rate limiting (6 intentos fallidos seguidos)');
    
    for (let i = 1; i <= 6; i++) {
      try {
        const response = await makeRequest('POST', '/auth/login', {
          username: 'test_rate_limit',
          password: 'wrong_password'
        });
        
        if (response.status === 429) {
          log.success(`Rate limiting funcionando: Bloqueó en intento ${i}`);
          return;
        } else if (response.status === 401) {
          console.log(`  Intento ${i}: Rechazado (esperado)`);
        }
      } catch (error) {
        console.log(`  Intento ${i}: Error (esperado)`);
      }
    }
    
    log.warn('Rate limiting no se activó después de 6 intentos');
  } catch (error) {
    log.error(`Error al probar rate limiting: ${error.message}`);
  }
  console.log('');
}

async function ejecutarPruebas() {
  console.log('='.repeat(60));
  console.log('🔒 PRUEBAS DE SISTEMA DE AUTENTICACIÓN SEGURO');
  console.log('='.repeat(60));
  console.log('');

  // Probar login de cada usuario
  for (const usuario of usuarios) {
    await probarLogin(usuario.username, usuario.password, usuario.nombre);
  }

  // Probar protecciones
  await probarCredencialesInvalidas();
  await probarRateLimiting();

  console.log('='.repeat(60));
  console.log('✅ PRUEBAS COMPLETADAS');
  console.log('='.repeat(60));
  console.log('');
  log.info('Revisa la tabla AuditoriaAcceso para ver los eventos registrados:');
  console.log('  SELECT TOP 20 * FROM AuditoriaAcceso ORDER BY FechaHora DESC;');
}

ejecutarPruebas().catch(error => {
  log.error(`Error fatal: ${error.message}`);
  process.exit(1);
});
