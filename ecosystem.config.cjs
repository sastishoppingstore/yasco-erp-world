module.exports = {
  apps: [{
    name: 'erp-backend',
    script: './dist/boot.js',
    cwd: '/opt/erp',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOST: '0.0.0.0',
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/opt/erp/logs/error.log',
    out_file: '/opt/erp/logs/out.log',
    merge_logs: true,
    autorestart: true,
  }]
};
