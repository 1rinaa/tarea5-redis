const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    const client = await getRedisClient();
    await client.del('bookstore');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Lista bookstore vaciada exitosamente en Redis.' })
    };
  } catch (error) {
    console.error('Error in clearQueue:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

