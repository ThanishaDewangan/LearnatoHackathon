import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();
const port = Number(process.env.PORT || 4000);

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*'
  }
});

io.on('connection', socket => {
  socket.on('disconnect', () => {});
});

server.listen(port, () => {
  console.log(`Backend listening on :${port}`);
});

