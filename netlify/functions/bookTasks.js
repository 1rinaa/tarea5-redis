const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Simulación de funciones batch
const batchInsertBook = async (data) => console.log('[BATCH INSERT BOOK]:', data);
const batchUpdateBook = async (id, data) => console.log('[BATCH UPDATE BOOK]:', id, data);
const batchDeleteBook = async (id) => console.log('[BATCH DELETE BOOK]:', id);

exports.handler = async () => {
  try {
    const client = await getRedisClient();
    const messages = await client.lrange('bookstore', 0, -1);
    let processed = 0;
    const actions = [];

    for (const msg of messages) {
      let task;
      try {
        task = JSON.parse(msg);
      } catch (e) {
        continue;
      }

      if (task.entity !== 'book') continue;

      switch (task.type) {
        case 'INSERT':
          await batchInsertBook(task.data);
          actions.push({ action: 'INSERT', id: task.data?.id || task.id, title: task.data?.title });
          break;
        case 'UPDATE':
          await batchUpdateBook(task.id, task.data);
          actions.push({ action: 'UPDATE', id: task.id, title: task.data?.title });
          break;
        case 'DELETE':
          await batchDeleteBook(task.id);
          actions.push({ action: 'DELETE', id: task.id });
          break;
      }
      processed++;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Procesados ${processed} eventos de libros desde la lista 'bookstore'.`,
        processed,
        actions
      })
    };
  } catch (error) {
    console.error('Error in bookTasks:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
