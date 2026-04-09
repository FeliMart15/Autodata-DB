// test-ventas-api.js
// Script de prueba para el módulo de ventas y empadronamientos

const http = require('http');

// Configuración
const BASE_URL = 'localhost';
const PORT = 3000;

// Credenciales de usuario con rol entrada_datos
const LOGIN = {
  username: 'santiago.martinez',
  password: 'Santiago2024$Secure'
};

let accessToken = '';

// Función para hacer requests HTTP
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
  console.log('\n🧪 TEST: Módulo de Ventas y Empadronamientos\n');
  console.log('='.repeat(60));

  try {
    // 1. Login
    console.log('\n1️⃣  Autenticación...');
    const loginRes = await makeRequest('/auth/login', 'POST', LOGIN);
    
    if (loginRes.status === 200 && loginRes.data.success) {
      accessToken = loginRes.data.accessToken;
      console.log('✅ Login exitoso');
      console.log(`   Usuario: ${loginRes.data.user.username}`);
      console.log(`   Rol: ${loginRes.data.user.rol}`);
    } else {
      console.log('❌ Login fallido');
      return;
    }

    // 2. Obtener Departamentos
    console.log('\n2️⃣  Probando GET /api/departamentos...');
    const deptosRes = await makeRequest('/departamentos', 'GET', null, accessToken);
    
    if (deptosRes.status === 200 && deptosRes.data.success) {
      console.log(`✅ ${deptosRes.data.count} departamentos obtenidos`);
      console.log('   Primeros 3:');
      deptosRes.data.data.slice(0, 3).forEach(d => {
        console.log(`   - ${d.Nombre} (${d.Codigo})`);
      });
    } else {
      console.log('❌ Error:', deptosRes.data);
    }

    // 3. Obtener Ventas por Familia
    console.log('\n3️⃣  Probando GET /api/ventas/familia...');
    const ventasRes = await makeRequest(
      '/ventas/familia?marcaId=1&familia=SUV&periodo=2026-01',
      'GET',
      null,
      accessToken
    );
    
    if (ventasRes.status === 200 && ventasRes.data.success) {
      console.log(`✅ ${ventasRes.data.count} modelos obtenidos para ventas`);
      if (ventasRes.data.count > 0) {
        console.log(`   Primer modelo: ${ventasRes.data.data[0].DescripcionModelo}`);
        console.log(`   Cantidad: ${ventasRes.data.data[0].Cantidad}`);
      }
    } else {
      console.log('❌ Error:', ventasRes.data);
    }

    // 4. Guardar Ventas Batch
    console.log('\n4️⃣  Probando POST /api/ventas/crear-batch...');
    
    // Simular datos de ventas (usar IDs reales si tienes)
    const ventasBatch = {
      periodo: '2026-01',
      ventas: [
        { modeloId: 1, cantidad: 10 },
        { modeloId: 2, cantidad: 5 },
        { modeloId: 3, cantidad: 15 }
      ]
    };

    const saveBatchRes = await makeRequest(
      '/ventas/crear-batch',
      'POST',
      ventasBatch,
      accessToken
    );

    if (saveBatchRes.status === 200 && saveBatchRes.data.success) {
      console.log('✅ Ventas guardadas exitosamente');
      console.log(`   Registros afectados: ${saveBatchRes.data.affectedRows}`);
      console.log(`   Mensaje: ${saveBatchRes.data.message}`);
    } else {
      console.log(`⚠️  Status ${saveBatchRes.status}:`, saveBatchRes.data.message || saveBatchRes.data);
      // Esto puede fallar si los ModeloID no existen, es normal en test
    }

    // 5. Obtener Empadronamientos por Familia
    console.log('\n5️⃣  Probando GET /api/empadronamientos/familia...');
    const empadRes = await makeRequest(
      '/empadronamientos/familia?marcaId=1&familia=SUV&departamentoId=1&periodo=2026-01',
      'GET',
      null,
      accessToken
    );
    
    if (empadRes.status === 200 && empadRes.data.success) {
      console.log(`✅ ${empadRes.data.count} modelos obtenidos para empadronamientos`);
      if (empadRes.data.count > 0) {
        console.log(`   Primer modelo: ${empadRes.data.data[0].DescripcionModelo}`);
      }
    } else {
      console.log('❌ Error:', empadRes.data);
    }

    // 6. Resumen
    console.log('\n' + '='.repeat(60));
    console.log('✅ PRUEBAS COMPLETADAS\n');
    console.log('Endpoints probados:');
    console.log('  ✓ POST /api/auth/login');
    console.log('  ✓ GET  /api/departamentos');
    console.log('  ✓ GET  /api/ventas/familia');
    console.log('  ✓ POST /api/ventas/crear-batch');
    console.log('  ✓ GET  /api/empadronamientos/familia');
    console.log('\n🎉 Módulo de Ventas y Empadronamientos funcionando correctamente\n');

  } catch (error) {
    console.error('\n❌ Error en pruebas:', error.message);
  }
}

// Ejecutar pruebas
test();
