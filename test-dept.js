const db = require('./src/config/db-simple');
db.queryRaw('SELECT * FROM Departamento WHERE Activo = 1').then(r => console.log(r)).catch(e => console.error(e));
