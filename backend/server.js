require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
const useMongo = !!(mongoUri && mongoUri.trim().length > 0);

let Message;
if (useMongo) {
  mongoose.set('strictQuery', true);
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));
  Message = require('./models/Message');
} else {
  console.log('ℹ️ Using in-memory storage');
  global.messageStore = {};
}

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const roomUsers = {};

async function getRoomMessages(room) {
  if (useMongo) {
    try {
      const msgs = await Message.find({ room }).sort({ timestamp: 1 }).lean();
      return msgs;
    } catch (err) {
      console.error('MongoDB find error:', err.message);
      return [];
    }
  } else {
    return global.messageStore[room] || [];
  }
}

async function saveMessage(room, username, text) {
  const data = { room, username, text, timestamp: new Date() };
  if (useMongo) {
    try {
      const msg = new Message(data);
      await msg.save();
      return msg;
    } catch (err) {
      console.error('MongoDB save error:', err.message);
    }
  }
  if (!global.messageStore[room]) global.messageStore[room] = [];
  global.messageStore[room].push(data);
  return data;
}

io.on('connection', (socket) => {
  console.log(`🔌 ${socket.id}`);

  socket.on('join_room', async ({ username, room }) => {
    const user = username?.trim().substring(0, 20);
    const roomName = room?.trim().substring(0, 30);
    if (!user || !roomName) return;

    socket.username = user;
    socket.room = roomName;
    socket.join(roomName);

    if (!roomUsers[roomName]) roomUsers[roomName] = {};
    roomUsers[roomName][socket.id] = user;

    const historico = await getRoomMessages(roomName);
    socket.emit('previous_messages', historico);

    socket.to(roomName).emit('user_joined', {
      username: user,
      message: `${user} entrou na sala`
    });
    io.to(roomName).emit('online_users', Object.values(roomUsers[roomName]));
  });

  socket.on('send_message', async ({ text }) => {
    if (!socket.room || !socket.username) return;
    const msgText = text?.trim();
    if (!msgText) return;

    const msg = await saveMessage(socket.room, socket.username, msgText);
    io.to(socket.room).emit('new_message', {
      _id: msg._id || Date.now(),
      username: socket.username,
      text: msgText,
      timestamp: msg.timestamp
    });
  });

  socket.on('get_rooms', () => {
    const rooms = Object.keys(roomUsers).filter(r => Object.keys(roomUsers[r] || {}).length > 0);
    socket.emit('room_list', rooms);
  });

  socket.on('disconnect', () => {
    if (socket.room && roomUsers[socket.room]) {
      delete roomUsers[socket.room][socket.id];
      const onlineNow = Object.values(roomUsers[socket.room]);
      io.to(socket.room).emit('online_users', onlineNow);
      socket.to(socket.room).emit('user_left', {
        username: socket.username,
        message: `${socket.username} saiu da sala`
      });
      if (onlineNow.length === 0) delete roomUsers[socket.room];
    }
  });
});

app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));