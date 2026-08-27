module.exports = {
  apps: [
    {
      name: 'autodata-backend',
      script: 'src/index.js',
      cwd: 'C:\\Users\\Administrador\\Documents\\GitHub\\Autodata-DB',
      instances: 1,
      autorestart: true,       // reinicia automáticamente si crashea
      watch: false,            // NO en producción (usa watch solo en dev con nodemon)
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/pm2_error.log',
      out_file: 'logs/pm2_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'autodata-frontend',
      script: 'start-frontend.js',
      args: '',
      cwd: 'C:\\Users\\Administrador\\Documents\\GitHub\\Autodata-DB',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'development'
      },
      error_file: 'logs/pm2_frontend_error.log',
      out_file: 'logs/pm2_frontend_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
