module.exports = {
  apps: [
    {
      name: 'todo-list',
      script: 'npm',
      args: 'start',
      cwd: '/home/furkan/projects/to-do-list',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/furkan/.pm2/logs/todo-list-error.log',
      out_file: '/home/furkan/.pm2/logs/todo-list-out.log',
      log_file: '/home/furkan/.pm2/logs/todo-list-combined.log',
      time: true
    }
  ]
};
