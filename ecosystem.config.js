export default {
  apps: [
    {
      name: 'plaka-backend',
      script: 'src/server.js',
      cwd: '/root/plaka/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/root/plaka/logs/backend-error.log',
      out_file: '/root/plaka/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'plaka-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/root/plaka',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/plaka/logs/frontend-error.log',
      out_file: '/root/plaka/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false
    }
  ]
};

