import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import connectDB from './db/connection.js'
import cors from 'cors'
import router from './routes/routes.js'


const app = express();
app.use(cors());
app.use(express.json());
app.use('/chat/user', router);

app.listen(process.env.PORT, async () => {
    connectDB();
    console.log("Server is running");
})