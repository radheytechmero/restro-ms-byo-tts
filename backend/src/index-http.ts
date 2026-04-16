import { Hono } from "hono";
import { getPrisma, Env } from "./middleware/prisma-client";
import { setUpOpenAPI } from "./openapi";
import { cors } from 'hono/cors';
import { createServer } from 'http';
import cron from 'node-cron';
import axios from 'axios';
import { globalConfig } from './config/globalConfig';
import 'dotenv/config';
import { IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer } from 'ws';
import { join, extname } from "path";
import { readFile, stat } from "fs/promises";
import mime from "mime"; // install: npm install mime

const app = new Hono<Env>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use('*', getPrisma);
setUpOpenAPI(app);

const envPort = process.env.PORT;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !envPort) {
  throw new Error("PORT must be set in production");
}

const port = envPort ? Number(envPort) : 5002;

if (!Number.isFinite(port) || port <= 0) {
  throw new Error(`Invalid PORT value: ${envPort}`);
}

const reactBuildPath = join(process.cwd(), "../frontend/dist"); // path to your React build folder

const listener = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, headers, url } = req;

  // Handle WebSocket upgrade
  if (headers.upgrade && headers.upgrade.toLowerCase() === 'websocket') {
    return;
  }

  // Try serving static files from React build
  const filePath = join(reactBuildPath, url === "/" ? "index.html" : url!);
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      const content = await readFile(filePath);
      res.writeHead(200, { "Content-Type": mime.getType(extname(filePath)) || "application/octet-stream" });
      res.end(content);
      return;
    }
  } catch (err) {
    // If file not found, serve index.html for React Router support
    if (method === "GET" && !url?.startsWith("/api")) {
      const content = await readFile(join(reactBuildPath, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
      return;
    }
  }

  // Otherwise, let Hono handle it
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const protocol = 'http';
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

let server = createServer(listener);

server.listen(port, () => {
  console.log(`🚀 HTTP server running at http://localhost:${port}`);
  console.log(`📦 Serving React build from ${reactBuildPath}`);
});

export default app;

// Schedule: every minute
const cronKey = process.env.CRON_SECRET_KEY || 'local-cron-key';

cron.schedule('* * * * *', async () => {
  try {
    // Build local URL to call our cron endpoint using the active server port.
    const url = `http://localhost:${port}${globalConfig.baseURL}/cron/update`;
    console.log(`[cron] Triggering: ${url} at ${new Date().toISOString()}`);
    await axios.post(url, {}, { headers: { 'x-cron-key': cronKey } });
    console.log('[cron] Success');
  } catch (err) {
    console.error('Cron run failed:', err instanceof Error ? err.message : String(err));
  }
});
