const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// Simulación de funciones batch para autores
const batchInsertAuthor = async (data) => console.log('[BATCH INSERT AUTHOR]:', data);
const batchUpdateAuthor = async (id, data) => console.log('[BATCH UPDATE AUTHOR]:', id, data);
const batchDeleteAuthor = async (id) => console.log('[BATCH DELETE AUTHOR]:', id);

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

      if (task.entity !== 'author') continue;

      switch (task.type) {
        case 'INSERT':
          await batchInsertAuthor(task.data);
          actions.push({ action: 'INSERT', id: task.data?.id || task.id, name: task.data?.name });
          break;
        case 'UPDATE':
          await batchUpdateAuthor(task.id, task.data);
          actions.push({ action: 'UPDATE', id: task.id, name: task.data?.name });
          break;
        case 'DELETE':
          await batchDeleteAuthor(task.id);
          actions.push({ action: 'DELETE', id: task.id });
          break;
      }
      processed++;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: `Procesados ${processed} eventos de autores desde la lista 'bookstore'.`,
        processed,
        actions
      })
    };
  } catch (error) {
    console.error('Error in authorTasks:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
