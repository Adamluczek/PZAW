import { createServer } from 'node:http';


const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('hello world!');
});

const port = 8000;
const host = "localhost";


server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});