import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import connectDB from './db/connection.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authentication from './routes/authentication.js'
import chat from './routes/chat.js'


const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authentication);
app.use('/api/chat', chat);

app.listen(process.env.PORT, async () => {
    connectDB();
    console.log("Server is running");
})