const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.static(path.join(__dirname, 'public')));

const players = new Map();

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('player:join', (data) => {
    const player = {
      id: socket.id,
      name: data.name || 'Unknown',
      class: data.class || 'warrior',
      x: data.x || 1600,
      y: data.y || 1600,
      level: data.level || 1,
      hp: data.hp || 100,
      maxHP: data.maxHP || 100,
      zone: data.zone || 'overworld'
    };
    players.set(socket.id, player);
    socket.emit('players:current', Array.from(players.values()).filter(p => p.id !== socket.id));
    socket.broadcast.emit('player:joined', player);
    console.log(`Player joined: ${player.name}`);
  });

  socket.on('player:move', (data) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      player.zone = data.zone || player.zone;
      socket.broadcast.emit('player:moved', { id: socket.id, x: data.x, y: data.y, zone: data.zone });
    }
  });

  socket.on('player:attack', (data) => {
    socket.broadcast.emit('player:attacked', { id: socket.id, ...data });
  });

  socket.on('player:update', (data) => {
    const player = players.get(socket.id);
    if (player) {
      Object.assign(player, data);
      socket.broadcast.emit('player:updated', { id: socket.id, ...data });
    }
  });

  socket.on('pvp:attack', (data) => {
    const target = io.sockets.sockets.get(data.targetId);
    if (target) {
      target.emit('pvp:hit', { attackerId: socket.id, damage: data.damage, type: data.type });
    }
    socket.broadcast.emit('pvp:attacked', { attackerId: socket.id, targetId: data.targetId, damage: data.damage });
  });

  socket.on('chat:message', (data) => {
    const player = players.get(socket.id);
    const name = player ? player.name : 'Unknown';
    io.emit('chat:message', { id: socket.id, name, message: data.message, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    socket.broadcast.emit('player:left', { id: socket.id });
    console.log(`Player disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`The Outbreak server running on http://localhost:${PORT}`);
});
