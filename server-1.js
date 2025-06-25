const WebSocket = require('ws');
const { exec } = require('child_process');

const PORT = 9000;
const PING_INTERVAL = 30000; // 30 seconds
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB

const server = new WebSocket.Server({
  port: PORT,
  maxPayload: MAX_MESSAGE_SIZE,
  clientTracking: true
});

// Keep track of all active connections
const connections = new Set();

server.on('connection', (socket) => {
  console.log('Client connected');
  connections.add(socket);
  
  // Set up ping-pong to keep connection alive
  const pingInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.ping();
    }
  }, PING_INTERVAL);

  socket.on('message', (message) => {
    try {
      const command = message.toString().trim();
      console.log(`Executing: ${command}`);

      if (!command) {
        socket.send('Error: Empty command');
        return;
      }

      // Execute command in Termux environment
      const child = exec(command, {
        shell: '/data/data/com.termux/files/usr/bin/bash',
        maxBuffer: 1024 * 1024 * 5 // 5MB buffer
      });

      child.stdout.on('data', (data) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data.toString());
        }
      });

      child.stderr.on('data', (data) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(`Error: ${data.toString()}`);
        }
      });

      child.on('close', (code) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(`Command exited with code ${code}`);
        }
      });

    } catch (error) {
      console.error('Error handling message:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`Error: ${error.message}`);
      }
    }
  });

  socket.on('pong', () => {
    // Connection is alive
    socket.isAlive = true;
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    clearInterval(pingInterval);
    connections.delete(socket);
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(pingInterval);
    connections.delete(socket);
  });

  // Initial alive state
  socket.isAlive = true;
});

// Check for dead connections periodically
setInterval(() => {
  server.clients.forEach((socket) => {
    if (socket.isAlive === false) {
      console.log('Terminating dead connection');
      return socket.terminate();
    }
    socket.isAlive = false;
    socket.ping();
  });
}, PING_INTERVAL);

server.on('error', (error) => {
  console.error('Server error:', error);
});

console.log(`Termux WebSocket server running on ws://0.0.0.0:${PORT}`);
