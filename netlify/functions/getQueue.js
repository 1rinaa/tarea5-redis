const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async () => {
  try {
    const client = await getRedisClient();
    const rawMessages = await client.lrange('bookstore', 0, -1);
    const parsedQueue = rawMessages.map((raw, index) => {
      try {
        return { index, raw, ...JSON.parse(raw) };
      } catch (e) {
        return { index, raw, parseError: true };
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'connected',
        count: parsedQueue.length,
        queue: parsedQueue,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      })
    };
  } catch (error) {
    console.error('Error in getQueue:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        error: error.message
      })
    };
  }
};

