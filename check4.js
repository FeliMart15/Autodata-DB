const db = require('./src/config/db-simple'); async function main() { const res = await db.query('SELECT * FROM PrecioModelo WHERE ModeloID = 63'); console.log(res); process.exit(); } main();
