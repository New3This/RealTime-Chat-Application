import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const onlineUsers = new Map();
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


    const currentlyOnline = onlineUsers.get(socket.data.userId) || 0;
    onlineUsers.set(socket.data.userId, currentlyOnline + 1); // add user socket id to online user map
    socket.join('onlineUsersRoom'); // online user room
    io.to("onlineUsersRoom").emit("updateOnlineUsers", Array.from(onlineUsers.keys())); 
    // send the map to everyone in this room, so that the frontend can update the total user count (done by emitting "updateOnlineUsers" event which sidebar listens for)
    
    socket.on('requestOnlineUsers', () => {
        socket.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });


    socket.on('joinConversation', (conversationId) => { // 2. listen for joinConversation and join the room
        socket.join(conversationId); // where receiver/sender socket joins room
        console.log('joined room:', conversationId);
    });

    socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
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
        const currentConnections = onlineUsers.get(socket.data.userId) || 0;

        if (currentConnections <= 1) {
            // Last tab closed: remove user completely
            onlineUsers.delete(socket.data.userId);
        } 
        else {
            // Still open in other tabs: just decrease the count
            onlineUsers.set(socket.data.userId, currentConnections - 1);
        }

        io.to("onlineUsersRoom").emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
        
    });

});

export {app, server, io}