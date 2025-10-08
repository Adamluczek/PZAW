import { createServer } from 'node:http';
import { handlePath } from './src/path_handlers.js';
import { URL } from 'node:url';

const port = 8000;
const host = "localhost";


const server = createServer((req, res) => {
  const request_url = new URL(`http://${host}${req.url}`);
  const path = request_url.pathname;
  

  handlePath(path, req, res);
  
  if (!res.writableEnded) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Site not found!\n');
  }
});



server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});