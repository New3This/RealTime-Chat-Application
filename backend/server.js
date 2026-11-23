
import 'dotenv/config'
import path from 'node:path'
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
    // grabs file url => turns into path => grab directory of path => then move to frontend/dist
    // file:///C:/Projects/realtimechat/backend/server.js
    // C:/Projects/realtimechat/backend/server.js
    // C:/Projects/realtimechat/backend
    // C:/Projects/realtimechat/frontend/dist
);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.static(frontendDistPath));

app.use(express.json());
app.use('/images', express.static('images'));
app.use(cookieParser());

app.use('/api/auth', authentication);
app.use('/chat', chat);

// React Router fallback
app.get('/{*url}', (_req, res) => { // match any url requests that isnt handled by api routes + middleware
    res.sendFile(path.join(frontendDistPath, 'index.html')); 
    // user opens new tab or refreshs page => browser send route request to server first => if route isnt api route
    // => express sends index html as entry point for react
    // react loads and react router starts finding matching routes to load
});

// Start server after connecting to MongoDB
const port = Number(process.env.PORT) || 3000;

connectDB()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    });

export default server;
