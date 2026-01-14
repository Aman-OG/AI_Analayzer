import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Connects to the MongoDB database using Mongoose.
 * Exits the process if connection fails.
 */
const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not defined.');
        }

        const conn = await mongoose.connect(mongoUri);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
