const http = require('http');
const fs = require('fs');
const path = require('path');

// Cargar variables de .env manualmente si no están en process.env
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const FUNCTIONS_DIR = path.join(__dirname, 'netlify', 'functions');

const server = http.createServer(async (req, res) => {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rutas de Netlify Functions: /.netlify/functions/<name>
  if (req.url.startsWith('/.netlify/functions/')) {
    const functionName = req.url.replace('/.netlify/functions/', '').split('?')[0];
    const functionPath = path.join(FUNCTIONS_DIR, `${functionName}.js`);

    if (fs.existsSync(functionPath)) {
      try {
        delete require.cache[require.resolve(functionPath)];
        const fnModule = require(functionPath);

        // Leer body si existe
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          const event = {
            httpMethod: req.method,
            path: req.url,
            headers: req.headers,
            body: body || null
          };

          try {
            const result = await fnModule.handler(event);
            res.writeHead(result.statusCode || 200, result.headers || { 'Content-Type': 'application/json' });
            res.end(result.body || '');
          } catch (handlerErr) {
            console.error(`Error en handler ${functionName}:`, handlerErr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: handlerErr.message }));
          }
        });
        return;
      } catch (err) {
        console.error(`Error al cargar la función ${functionName}:`, err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Función ${functionName} no encontrada` }));
      return;
    }
  }

  // Archivos estáticos de public/
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error interno del servidor');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(` Servidor local de desarrollo corriendo en: http://${HOST}:${PORT}`);
  console.log(` Conectado a Redis Cloud en: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
});
