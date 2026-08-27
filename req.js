const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/departamentos',
  method: 'GET'
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('HTTP', res.statusCode, body));
});
req.end();
