const { getRedisClient } = require('./_utils/redisClient');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const defaultData = {
  authors: [
    {
      id: '1',
      name: 'Abraham Silberschatz',
      nationality: 'Israelis / American',
      birthYear: '1952',
      specialization: 'Database Systems, Operating Systems'
    },
    {
      id: '2',
      name: 'Andrew S. Tanenbaum',
      nationality: 'Dutch / American',
      birthYear: '1944',
      specialization: 'Distributed Systems, Computer Networks'
    }
  ],
  publishers: [
    {
      id: '1',
      name: 'John Wiley & Sons',
      country: 'United States',
      foundationYear: '1807',
      genre: 'Academic'
    },
    {
      id: '2',
      name: 'Prentice Hall',
      country: 'United States',
      foundationYear: '1913',
      genre: 'Computer Science & Technology'
    }
  ],
  books: [
    {
      id: '1',
      title: 'Operating System Concepts',
      copyright: '2012',
      edition: '9th',
      language: 'ENGLISH',
      authorId: '1',
      publisherId: '1'
    },
    {
      id: '2',
      title: 'Distributed Systems: Principles and Paradigms',
      copyright: '2016',
      edition: '3rd',
      language: 'ENGLISH',
      authorId: '2',
      publisherId: '2'
    }
  ]
};

exports.handler = async () => {
  try {
    const client = await getRedisClient();
    const stored = await client.get('bookstore:entities');

    if (stored) {
      return {
        statusCode: 200,
        headers,
        body: stored
      };
    }

    // Si aún no existe en Redis, inicializamos con los datos por defecto
    await client.set('bookstore:entities', JSON.stringify(defaultData));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(defaultData)
    };
  } catch (error) {
    console.error('Error in getEntities:', error);
    // Fallback a los datos por defecto si hay problemas
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(defaultData)
    };
  }
};

