const Redis = require('ioredis');

let client;

const getRedisClient = async () => {
  if (!client || client.status === 'end') {
    const config = {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      }
    };

    // Solo habilitar TLS si explícitamente se solicita en REDIS_TLS
    if (process.env.REDIS_TLS === 'true') {
      config.tls = {
        rejectUnauthorized: false
      };
    }

    client = new Redis(config);

    client.on('error', (err) => {
      console.error('🚨 ERROR DE CONEXIÓN A REDIS:', err.message);
    });
  }
  return client;
};

module.exports = { getRedisClient };
