module.exports = {
  apps: [{
    name: 'erp-backend',
    script: './dist/boot.js',
    cwd: '/home/ubuntu/erp',
    node_args: '--experimental-transform-types',
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
    error_file: '/home/ubuntu/erp/logs/error.log',
    out_file: '/home/ubuntu/erp/logs/out.log',
    merge_logs: true,
    autorestart: true,
  }]
};
