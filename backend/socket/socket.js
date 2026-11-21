import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    path: '/socket.io/',
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    const token = cookieHeader
        ?.split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('token='))
        ?.slice('token='.length);

    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.userId = user.id;
        return next();
    }
    catch {
        return next(new Error('Invalid or expired token'));
    }
})

async function getOnlineUserIds() {
    const sockets = await io.in('onlineUsersRoom').fetchSockets();
    return [...new Set(sockets.map((socket) => String(socket.data.userId)))];
}

async function broadcastOnlineUsers() {
    io.to('onlineUsersRoom').emit('updateOnlineUsers', await getOnlineUserIds());
}

export async function initializeSocket() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        if (process.env.VERCEL) {
            throw new Error('No redis for Vercel');
        }
        return;
    }

    const publisher = createClient({ url: redisUrl });
    const subscriber = publisher.duplicate();
    publisher.on('error', (error) => console.error('Redis publisher error:', error));
    subscriber.on('error', (error) => console.error('Redis subscriber error:', error));

    await Promise.all([publisher.connect(), subscriber.connect()]);
    io.adapter(createAdapter(publisher, subscriber));
}

io.on("connection", (socket) => {
    console.log("user joined", socket.id);
    const roomsJoined = Promise.all([
        socket.join(`user:${socket.data.userId}`),
        socket.join('onlineUsersRoom')
    ]);

    roomsJoined.then(broadcastOnlineUsers).catch((error) => {
        console.error('Failed to broadcast online users:', error);
    });
    
    socket.on('requestOnlineUsers', async () => {
        try {
            await roomsJoined;
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
    socket.on('userTyping', conversationId => {
        console.log("HERE");
        socket.to(conversationId).emit("typing", socket.data.userId);
    });

    socket.on('userNotTyping', conversationId => {
        socket.to(conversationId).emit("stopTyping", socket.data.userId);
    });

    socket.on('disconnect', () => {
        broadcastOnlineUsers().catch((error) => {
            console.error('Failed to broadcast online users:', error);
        });
    });

});

export {app, server, io}