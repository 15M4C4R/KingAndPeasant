import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectRedis, redisClient } from './config/redis.js';
import lobbyRoutes from './src/routes/LobbyRoutes.js';
import userRoutes from './src/routes/UserRoutes.js';
import friendshipRoutes from './src/routes/FriendshipRoutes.js';
import gameRoutes from './src/routes/GameRoutes.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { lobbySocket } from './src/sockets/LobbySocket.js';
import { gameSocket } from './src/sockets/GameSocket.js';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const app = express();
const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

const port = 3000;
const userSockets= new Map();

connectRedis();

app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
    res.send("Hello World!");
});

app.use('/api/lobby', lobbyRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/friendship', friendshipRoutes);

app.use('/api/game', gameRoutes);

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Errore de autenticación: token no proporcionado'));
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        return next(new Error('Error de autenticación'));
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    userSockets.set(socket.userId, socket.id);
    console.log(`User ${socket.userId} registered with socket ID: ${socket.id}`); 
    /*
    socket.on('register', (userId) => {
        userSockets.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    });
    */
    lobbySocket(io, socket);
    gameSocket(io, socket);

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
        
        console.log('A user disconnected:', socket.id);
    });

    socket.on('getOnlineUsers', (callback) => {
        const onlineIds = Array.from(userSockets.keys()).map(id => Number(id));
        callback(onlineIds);
    });

});

app.set('io', io);
app.set('userSockets', userSockets);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});

export { io, userSockets };


