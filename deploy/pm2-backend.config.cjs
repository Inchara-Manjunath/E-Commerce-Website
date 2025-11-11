module.exports = {
  apps: [
    {
      name: "ecommerce-backend",
      script: "server.js",
      cwd: "./ecommerce-backend",
      env: {
        PORT: "3000"
        // Add DATABASE_URL or other env vars here if needed
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "300M",
      out_file: "/var/log/pm2/ecommerce-backend.out.log",
      error_file: "/var/log/pm2/ecommerce-backend.err.log",
      time: true
    }
  ]
};


