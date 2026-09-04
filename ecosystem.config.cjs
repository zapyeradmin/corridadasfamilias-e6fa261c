// PM2 process file for the Corrida das Famílias app on a Node VPS.
// Usage on the VPS:
//   pm2 start ecosystem.config.cjs
//   pm2 reload corridadasfamilias   # zero-downtime reload after deploy
//   pm2 save && pm2 startup         # persist across reboots
module.exports = {
  apps: [
    {
      name: "corridadasfamilias",
      script: "./.output/server/index.mjs",
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
      autorestart: true,
      exp_backoff_restart_delay: 100,
      kill_timeout: 3000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
    },
  ],
};
