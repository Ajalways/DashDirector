module.exports = {
  apps: [{
    name: 'pulseboardai',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/pulseboardai-error.log',
    out_file: '/var/log/pm2/pulseboardai-out.log',
    log_file: '/var/log/pm2/pulseboardai-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    watch: false,
    ignore_watch: [
      'node_modules',
      'uploads',
      'logs'
    ]
  }]
};