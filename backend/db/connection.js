import mongoose from 'mongoose';

let connectionPromise;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2 && connectionPromise) {
        return connectionPromise;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }

    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
        .then(() => mongoose.connection)
        .catch((error) => {
            connectionPromise = undefined;
            throw error;
        });

    return connectionPromise;
}

export default connectDB;