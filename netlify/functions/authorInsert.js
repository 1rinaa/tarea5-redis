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
    const authorData = JSON.parse(event.body || '{}');
    if (!authorData.id) {
      authorData.id = Date.now().toString();
    }
    const message = JSON.stringify({
      type: 'INSERT',
      entity: 'author',
      id: String(authorData.id),
      data: authorData,
      timestamp: new Date().toISOString()
    });

    const client = await getRedisClient();
    await client.rpush('bookstore', message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Author insert event queued', data: authorData })
    };
  } catch (error) {
    console.error('Error in authorInsert:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
