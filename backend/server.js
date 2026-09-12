import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import connectDB from './db/connection.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authentication from './routes/authentication.js'
import chat from './routes/chat.js'
import {app, server} from "./socket/socket.js"

app.use(cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
}));
app.use(express.json());
app.use('/images', express.static('images'));
app.use(cookieParser());
app.use('/api/auth', authentication);
app.use('/chat', chat);

server.listen(process.env.PORT, async () => {
    connectDB();
    console.log("Server is running");
})