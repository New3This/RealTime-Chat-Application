import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './db/connection.js'
import authentication from './routes/authentication.js'
import chat from './routes/chat.js'
import { app, server, initializeSocket } from './socket/socket.js'

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use('/images', express.static('images'));
app.use(cookieParser());
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        next(error);
    }
});
app.use('/api/auth', authentication);
app.use('/chat', chat);

await initializeSocket();

if (!process.env.VERCEL) {
    const port = Number(process.env.PORT) || 3000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export { app, server };
export default server;