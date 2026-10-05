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
    let cookie = socket.handshake.headers.cookie; // gets token=header.payload.signature
    let token = cookie.split('=')[1]; // grab everything after = sign

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET); // verify token
        socket.data.userId = user.id; // store user in socket.data for backend to verify user (instead of relying on frontend to pass identity)
        next();
    }
    catch (err) {
        console.log(err);
    }
})

io.on("connection", (socket) => {
    console.log("user joined", socket.id);
    socket.join(`user:${socket.data.userId}`);

    socket.on('joinConversation', (conversationId) => { // 2. listen for joinConversation and join the room
        socket.join(conversationId); // where receiver/sender socket joins room
        console.log('joined room:', conversationId);
    });

    socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
    });
});

export {app, server, io}