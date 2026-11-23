import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    const token = cookieHeader.split('=')[1];


    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.userId = user.id;
        return next();
    } catch {
        return next(new Error('Invalid or expired token'));
    }
});

async function getOnlineUserIds() {
    const sockets = await io.in('onlineUsersRoom').fetchSockets();
    return [...new Set(sockets.map((socket) => String(socket.data.userId)))];
}

async function broadcastOnlineUsers() {
    io.to('onlineUsersRoom').emit('updateOnlineUsers', await getOnlineUserIds());
}

io.on('connection', async (socket) => {
    console.log('user joined', socket.id);
    try {
        await Promise.all([
            socket.join(`user:${socket.data.userId}`), //
            socket.join('onlineUsersRoom') // calculate who is online
        ]);

        await broadcastOnlineUsers()
    }

    catch (err) {
        console.error("Failed to fetch users");
    }


    socket.on('requestOnlineUsers', async () => {
        try {
            socket.emit('updateOnlineUsers', await getOnlineUserIds());
        } catch (error) {
            console.error('Failed to fetch online users:', error);
        }
    });

    socket.on('joinConversation', async (conversationId) => {
        try {
            await socket.join(conversationId);
        } catch (error) {
            console.error('Failed to join conversation room:', error);
        }
    });

    socket.on('leaveConversation', async (conversationId) => {
        try {
            await socket.leave(conversationId);
        } catch (error) {
            console.error('Failed to leave conversation room:', error);
        }
    });

    // [user] is typing - msg indicator
    socket.on('userTyping', (conversationId) => {
        console.log('HERE');
        socket.to(conversationId).emit('typing', socket.data.userId);
    });

    socket.on('userNotTyping', (conversationId) => {
        socket.to(conversationId).emit('stopTyping', socket.data.userId);
    });

    socket.on('disconnect', () => {
        broadcastOnlineUsers().catch((error) => {
            console.error('Failed to broadcast online users:', error);
        });
    });
});

export { app, server, io };