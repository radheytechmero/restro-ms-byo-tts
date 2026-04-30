import { Hono } from "hono";
import { getPrisma, Env } from "./middleware/prisma-client";
import { setUpOpenAPI } from "./openapi";
import { cors } from 'hono/cors';
import { readFileSync } from 'fs';
import { createServer } from 'http';
import 'dotenv/config';
import { IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const app = new Hono<Env>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use('*', getPrisma);
setUpOpenAPI(app);

const port = process.env.PORT;

// let options;
// try {
//   options = {
//     cert: readFileSync('./src/cert/cert.pem'),
//     key: readFileSync('./src/cert/key.pem'),
//   };
//   console.log('✅ SSL certificates loaded successfully');
// } catch (error) {
//   console.warn('⚠️ SSL certificates not found. Creating self-signed certificates for testing...');
//   // For development/testing, you can create self-signed certificates
//   // or use HTTP instead of HTTPS
//   console.log('Please add your SSL certificates to src/cert/cert.pem and src/cert/key.pem');
//   console.log('For testing, you can create self-signed certificates using:');
//   console.log('openssl req -x509 -newkey rsa:4096 -keyout src/cert/key.pem -out src/cert/cert.pem -days 365 -nodes');
//   process.exit(1);
// }

const listener = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, headers, url } = req;

  // Check if this is a WebSocket upgrade request
  if (headers.upgrade && headers.upgrade.toLowerCase() === 'websocket') {
    // Let the WebSocket server handle this request
    return;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const protocol = 'https'; // You could also make this dynamic
  const host = headers.host || 'localhost';

  const request = new Request(`${protocol}://${host}${url}`, {
    method,
    headers: headers as Record<string, string>,
    body: ['GET', 'HEAD'].includes(method!) ? undefined : body,
  });

  const response = await app.fetch(request);

  res.writeHead(response.status, Object.fromEntries(response.headers));
  const responseBody = await response.arrayBuffer();
  res.end(Buffer.from(responseBody));
};


let server = createServer( listener)

server.listen(port, () => {
  console.log(`🚀 HTTPS server running at https://localhost:${port}`);
});

export default app;
