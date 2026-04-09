// Script simple para probar login
const http = require('http');

const data = JSON.stringify({
  username: 'admin',
  password: 'Autodata9001_'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🔄 Enviando request de login...\n');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const jsonBody = JSON.parse(body);
      console.log(JSON.stringify(jsonBody, null, 2));
      
      if (jsonBody.success) {
        console.log('\n✅ LOGIN EXITOSO!');
        console.log(`Usuario: ${jsonBody.user.username}`);
        console.log(`Rol: ${jsonBody.user.rol}`);
        console.log(`Token: ${jsonBody.token.substring(0, 30)}...`);
      } else {
        console.log('\n❌ LOGIN FALLIDO');
        console.log(`Mensaje: ${jsonBody.message}`);
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();

// Dar tiempo para que complete
setTimeout(() => {
  console.log('\n✅ Test completado');
  process.exit(0);
}, 3000);
