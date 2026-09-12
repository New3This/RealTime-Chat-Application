import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("user joined", socket.id);

    socket.on('joinConversation', (conversationId) => { // 2. listen for joinConversation and join the room
        socket.join(conversationId); // where receiver/sender socket joins room
        console.log('joined room:', conversationId);
    });

    socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
    });
});

export {app, server, io}