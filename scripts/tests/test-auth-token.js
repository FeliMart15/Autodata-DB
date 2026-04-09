// test-auth-token.js
// Script para verificar si el problema de autenticación es general

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
      console.log(`   Enviando token: Bearer ${token.substring(0, 50)}...`);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (error) {
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

async function test() {
  console.log('\n🧪 TEST: Verificar Autenticación\n');
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
    console.log('   Respuesta completa:', JSON.stringify(loginRes.data, null, 2));
    
    if (!accessToken) {
      console.log('❌ No se recibió token');
      return;
    }
    
    console.log(`   Token recibido: ${accessToken.substring(0, 50)}...`);

    // 2. Probar marcas (endpoint que debería funcionar)
    console.log(`\n2️⃣  Probando GET /api/marcas...`);
    const marcasRes = await makeRequest('/marcas', 'GET', null, accessToken);
    console.log(`   Status: ${marcasRes.status}`);
    if (marcasRes.status === 200) {
      console.log(`   ✅ Marcas obtenidas: ${marcasRes.data.length || 0}`);
    } else {
      console.log(`   ❌ Error:`, marcasRes.data);
    }

    // 3. Probar modelos
    console.log(`\n3️⃣  Probando GET /api/modelos...`);
    const modelosRes = await makeRequest('/modelos?limit=5', 'GET', null, accessToken);
    console.log(`   Status: ${modelosRes.status}`);
    if (modelosRes.status === 200) {
      console.log(`   ✅ Modelos obtenidos: ${modelosRes.data.data?.length || 0}`);
    } else {
      console.log(`   ❌ Error:`, modelosRes.data);
    }

    // 4. Probar ventas/familia
    console.log(`\n4️⃣  Probando GET /api/ventas/familia...`);
    const ventasRes = await makeRequest('/ventas/familia?familiaId=1&periodo=2026-02', 'GET', null, accessToken);
    console.log(`   Status: ${ventasRes.status}`);
    if (ventasRes.status === 200) {
      console.log(`   ✅ Ventas obtenidas`);
    } else {
      console.log(`   ❌ Error:`, ventasRes.data);
    }

    // 5. Probar ventas/modelo/:id/historial
    console.log(`\n5️⃣  Probando GET /api/ventas/modelo/1/historial...`);
    const historialRes = await makeRequest('/ventas/modelo/1/historial?limit=12', 'GET', null, accessToken);
    console.log(`   Status: ${historialRes.status}`);
    if (historialRes.status === 200) {
      console.log(`   ✅ Historial obtenido`);
      console.log(`   Datos:`, JSON.stringify(historialRes.data, null, 2));
    } else {
      console.log(`   ❌ Error:`, historialRes.data);
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error en pruebas:', error);
  }
}

test();
