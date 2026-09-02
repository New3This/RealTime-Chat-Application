import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import connectDB from './db/connection.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './routes/routes.js'


const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', router);

app.listen(process.env.PORT, async () => {
    connectDB();
    console.log("Server is running");
})