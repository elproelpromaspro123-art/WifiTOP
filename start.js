// Script para ejecutar Next.js y servidor speedtest simultáneamente en Railway
const { spawn } = require('child_process');
const path = require('path');

// Ejecutar Next.js
console.log('🚀 Iniciando Next.js...');
const nextProcess = spawn('npm', ['run', 'start'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Ejecutar servidor speedtest en puerto 3001 después de un delay
setTimeout(() => {
  console.log('🚀 Iniciando servidor speedtest...');
  const speedtestProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: process.env.SPEEDTEST_PORT || 3001
    }
  });

  speedtestProcess.on('error', (err) => {
    console.error('Error iniciando speedtest:', err);
    process.exit(1);
  });
}, 3000);

nextProcess.on('error', (err) => {
  console.error('Error iniciando Next.js:', err);
  process.exit(1);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando procesos...');
  process.exit(0);
});
