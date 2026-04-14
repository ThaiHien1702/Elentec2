module.exports = {
  apps: [
    {
      name: "elentec2-backend",
      cwd: "./backend",
      script: "src/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 5001,
      },
    },
  ],
};
