const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'PUT, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };
  if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { id, ...publisherData } = JSON.parse(event.body || '{}');
    const pubId = String(id || publisherData.id);
    const message = JSON.stringify({
      type: 'UPDATE',
      entity: 'publisher',
      id: pubId,
      data: { id: pubId, ...publisherData },
      timestamp: new Date().toISOString()
    });

    const client = await getRedisClient();
    await client.rpush('bookstore', message);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Publisher update event queued', id: pubId, data: publisherData })
    };
  } catch (error) {
    console.error('Error in publisherUpdate:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
