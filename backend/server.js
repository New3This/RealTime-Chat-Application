import 'dotenv/config'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './db/connection.js'
import authentication from './routes/authentication.js'
import chat from './routes/chat.js'
import { app, server } from './socket/socket.js'

const frontendDistPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../frontend/dist'
);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
if (existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get(['/login', '/register', '/chat'], (_req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}
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

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


export { app, server };
export default server;