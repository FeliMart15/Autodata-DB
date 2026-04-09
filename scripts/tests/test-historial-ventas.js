// test-historial-ventas.js
// Script para probar el endpoint de historial de ventas

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

const LOGIN = {
  username: 'santiago.martinez',
  password: 'Santiago2024$Secure'
};

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
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

async function test() {
  console.log('\n🧪 TEST: Historial de Ventas por Modelo\n');
  console.log('='.repeat(60));

  try {
    // 1. Login
    console.log('\n1️⃣  Autenticación...');
    const loginRes = await makeRequest('/auth/login', 'POST', LOGIN);
    
    if (loginRes.status !== 200 || !loginRes.data.success) {
      console.log('❌ Login fallido:', loginRes.data);
      return;
    }

    const accessToken = loginRes.data.token || loginRes.data.accessToken;
    console.log('✅ Login exitoso');
    console.log(`   Usuario: ${loginRes.data.user.username}`);
    console.log(`   Rol: ${loginRes.data.user.rol}`);

    // 2. Probar historial de ventas para varios modelos
    const modelosIds = [1, 2, 54, 55];

    for (const modeloId of modelosIds) {
      console.log(`\n2️⃣  Probando GET /api/ventas/modelo/${modeloId}/historial...`);
      
      const historialRes = await makeRequest(
        `/ventas/modelo/${modeloId}/historial?limit=12`,
        'GET',
        null,
        accessToken
      );
      
      console.log(`   Status: ${historialRes.status}`);
      console.log(`   Response:`, JSON.stringify(historialRes.data, null, 2));

      if (historialRes.status === 200 && historialRes.data.success) {
        console.log(`   ✅ ${historialRes.data.count} ventas encontradas`);
        if (historialRes.data.count > 0) {
          console.log(`   Primera venta:`, historialRes.data.data[0]);
        }
      } else {
        console.log(`   ❌ Error:`, historialRes.data.message || historialRes.data);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ PRUEBAS COMPLETADAS\n');

  } catch (error) {
    console.error('\n❌ Error en pruebas:', error);
  }
}

test();
