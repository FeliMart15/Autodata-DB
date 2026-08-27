/**
 * Wrapper para lanzar el frontend Vite desde PM2 en Windows.
 * PM2 no puede ejecutar npm/npm.cmd directamente; este script intermedio
 * usa child_process para lanzar 'npm.cmd run dev' correctamente.
 */
const { spawn } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');

const child = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

child.on('error', (err) => {
  console.error('[start-frontend] Error al lanzar Vite:', err.message);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`[start-frontend] Vite terminó con código: ${code}`);
  process.exit(code ?? 0);
});
