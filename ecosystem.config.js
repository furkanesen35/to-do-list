module.exports = {
  apps: [
    {
      name: 'office-todo-list',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: 'C:/Users/furkan/Desktop/projects/to-do-list',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
