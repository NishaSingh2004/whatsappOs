const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active Baileys socket connections in memory
const sessions = new Map();

// Helper to initialize a Baileys session for a given org_id
async function initSession(org_id, socketClient) {
  const sessionDir = `./sessions/org_${org_id}`;
  
  // Initialize multi-file auth state
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }), // Suppress detailed logs for cleanliness
  });

  // Save credentials on updates
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Forward the raw QR code string to the connected frontend client
      if (socketClient) {
        socketClient.emit('qr_code', { org_id, qr });
      }
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed for org_${org_id}. Reconnecting: ${shouldReconnect}`);
      
      if (socketClient) {
        if (!shouldReconnect) {
          socketClient.emit('status', { org_id, status: 'Logged Out' });
          // If explicitly logged out, remove session files
          fs.rmSync(sessionDir, { recursive: true, force: true });
          sessions.delete(org_id);
        } else {
          socketClient.emit('status', { org_id, status: 'Disconnected - Reconnecting' });
          // Attempt to reconnect
          initSession(org_id, socketClient);
        }
      }
    } else if (connection === 'open') {
      console.log(`Connection opened successfully for org_${org_id}`);
      if (socketClient) {
        socketClient.emit('status', { org_id, status: 'Connected' });
      }
    }
  });

  // Store the active socket
  sessions.set(org_id, sock);
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Client requests to start or monitor a session for an org
  socket.on('start_session', async ({ org_id }) => {
    console.log(`Starting session request for org: ${org_id}`);
    
    // If a session is already active in memory, just emit its status
    // Wait, if it's already active but we need a QR, we might need to recreate it if it's expired.
    // For simplicity, we just initialize/attach the listener.
    
    // If it exists but is connected, tell the client it's connected.
    if (sessions.has(org_id)) {
      // In a real app we'd check if the socket is actually open.
      // We'll re-initialize the listener by just re-calling initSession which overwrites the Map.
    }
    
    try {
      socket.emit('status', { org_id, status: 'Initializing' });
      await initSession(org_id, socket);
    } catch (err) {
      console.error(err);
      socket.emit('error', { org_id, error: err.message });
    }
  });

  // Client requests to delete a session explicitly
  socket.on('logout_session', ({ org_id }) => {
    if (sessions.has(org_id)) {
      const sock = sessions.get(org_id);
      sock.logout();
      sessions.delete(org_id);
    }
    const sessionDir = `./sessions/org_${org_id}`;
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
    socket.emit('status', { org_id, status: 'Logged Out' });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Note: We don't terminate the Baileys session when the frontend socket disconnects.
    // The WhatsApp bot should remain active in the background!
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WhatsApp Microservice running on port ${PORT}`);
});
