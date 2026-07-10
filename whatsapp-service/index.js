import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import cors from 'cors';
import fs from 'fs';

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
  console.log(`initSession called for ${org_id}`);
  const sessionDir = `./sessions/org_${org_id}`;
  
  // Initialize multi-file auth state
  console.log(`Getting auth state from ${sessionDir}`);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  console.log(`Auth state initialized`);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'trace' }), // Enable logs to see what's happening
  });
  console.log(`Socket created`);

  // Save credentials on updates
  sock.ev.on('creds.update', saveCreds);

  // Handle connection updates
  sock.ev.on('connection.update', (update) => {
    console.log('Connection update for', org_id, ':', JSON.stringify(update));
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('QR Code received for', org_id);
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
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
          } catch (e) {
            console.error(`Failed to delete session directory ${sessionDir}:`, e.message);
          }
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

  // Handle incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return; // Ignore if from ourselves

      // Check if it's a direct message (not a group)
      const remoteJid = msg.key.remoteJid;
      if (remoteJid.endsWith('@g.us')) return;

      const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const pushName = msg.pushName;
      const phoneNumber = remoteJid.split('@')[0];

      console.log(`Received message from ${phoneNumber} for org_${org_id}: ${messageText}`);

      // Forward to FastAPI webhook
      const webhookUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${webhookUrl}/api/v1/whatsapp/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          org_id: org_id,
          phone_number: phoneNumber,
          profile_name: pushName || null,
          message: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          // Send automated reply
          await sock.sendMessage(remoteJid, { text: data.reply });
        }
      } else {
        console.error(`Webhook failed with status: ${response.status}`);
      }

    } catch (err) {
      console.error('Error handling incoming message:', err);
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
    try {
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      }
    } catch (e) {
      console.error(`Failed to delete session directory ${sessionDir}:`, e.message);
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
