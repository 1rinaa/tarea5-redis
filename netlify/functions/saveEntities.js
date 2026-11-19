const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const payload = JSON.parse(event.body || '{}');
    const client = await getRedisClient();
    await client.set('bookstore:entities', JSON.stringify(payload));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Entidades actualizadas en Redis' })
    };
  } catch (error) {
    console.error('Error in saveEntities:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

