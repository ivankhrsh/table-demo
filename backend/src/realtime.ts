import { FastifyInstance } from 'fastify';
import { pgClient, pgListenClient } from './db';

interface RealtimeClient {
  id: string;
  send: (data: string) => void;
  keepaliveInterval?: NodeJS.Timeout;
}

const clients = new Map<string, RealtimeClient>();
const KEEPALIVE_INTERVAL = 30000; // 30 seconds

function setupListenClient() {
  pgListenClient.connect()
    .then(() => {
      console.log('PostgreSQL LISTEN client connected');

      // Listen to Postgres NOTIFY events
      pgListenClient.on('notification', (msg) => {
        if (msg.channel === 'row_updates' && msg.payload) {
          const payload = msg.payload;
          // Broadcast to all connected clients
          clients.forEach((client) => {
            try {
              client.send(payload);
            } catch (error) {
              console.error(`Error sending to client ${client.id}:`, error);
              clients.delete(client.id);
            }
          });
        }
      });

      // Start listening to Postgres notifications
      pgListenClient.query('LISTEN row_updates').catch((err) => {
        console.error('Error setting up LISTEN:', err);
      });
    })
    .catch((err) => {
      console.error('Error connecting listen client:', err);
      // Retry connection after 5 seconds
      setTimeout(() => {
        console.log('Retrying LISTEN client connection...');
        setupListenClient();
      }, 5000);
    });

  // Handle disconnection
  pgListenClient.on('end', () => {
    console.log('PostgreSQL LISTEN client disconnected, reconnecting...');
    setTimeout(() => {
      setupListenClient();
    }, 5000);
  });

  pgListenClient.on('error', (err) => {
    console.error('PostgreSQL LISTEN client error:', err);
    // Reconnect on error
    setTimeout(() => {
      setupListenClient();
    }, 5000);
  });
}

export function setupRealtime(server: FastifyInstance) {
  // Connect LISTEN client
  setupListenClient();

  // SSE endpoint for realtime updates
  server.get('/rows/realtime', async (request, reply) => {
    const clientId = `${Date.now()}-${Math.random()}`;
    const origin = request.headers.origin || '*';
    
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    });

    const client: RealtimeClient = {
      id: clientId,
      send: (data: string) => {
        try {
          reply.raw.write(`data: ${data}\n\n`);
        } catch (error) {
          console.error(`Error writing to client ${clientId}:`, error);
          clients.delete(clientId);
        }
      },
    };

    clients.set(clientId, client);

    // Send initial connection message
    client.send(JSON.stringify({ type: 'connected' }));

    // Set up keepalive ping every 30 seconds
    client.keepaliveInterval = setInterval(() => {
      if (clients.has(clientId)) {
        try {
          client.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error(`Error sending keepalive to client ${clientId}:`, error);
          clearInterval(client.keepaliveInterval);
          clients.delete(clientId);
        }
      }
    }, KEEPALIVE_INTERVAL);

    request.raw.on('close', () => {
      if (client.keepaliveInterval) {
        clearInterval(client.keepaliveInterval);
      }
      clients.delete(clientId);
    });
  });
}

export function notifyRowUpdate(row: any) {
  // Escape single quotes and send NOTIFY
  const payload = JSON.stringify(row).replace(/'/g, "''");
  pgClient.query(`NOTIFY row_updates, '${payload}'`).catch((err) => {
    console.error('Error sending NOTIFY:', err);
  });
}
