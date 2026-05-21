// PM2 process file for the Corrida das Famílias app on a Node VPS.
// Usage on the VPS:
//   pm2 start ecosystem.config.cjs
//   pm2 reload corridadasfamilias   # zero-downtime reload after deploy
//   pm2 save && pm2 startup         # persist across reboots
module.exports = {
  apps: [
    {
      name: "corridadasfamilias",
      script: "./server-node.mjs",
      instances: 2, // cluster mode, 2 workers (CX33 has 4 vCPU)
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
