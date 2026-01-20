require('dotenv').config();
const app = require('./app');
const db = require('./config/db-simple');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

// Verificar conexión a la base de datos antes de iniciar
db.queryRaw('SELECT 1 AS test')
  .then((result) => {
    logger.info('✓ Conexión a SQL Server exitosa');
    logger.info(`✓ Test query result: ${JSON.stringify(result[0])}`);
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API disponible en: http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    logger.error('✗ Error al conectar con SQL Server:', err);
    logger.error('Verifica tu configuración');
    process.exit(1);
  });

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  db.close()
    .then(() => {
      logger.info('Conexiones cerradas');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Error al cerrar conexiones:', err);
      process.exit(1);
    });
});
