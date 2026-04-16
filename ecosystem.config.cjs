module.exports = {
  apps: [
    {
      name: "restro-backend",
      cwd: "./backend",
      script: "dist/index-http.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
