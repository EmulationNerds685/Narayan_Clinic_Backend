import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../src/models/appointment.js';

dotenv.config();

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB...");
        
        // Backfill status for missing, empty, or null values
        const statusResult = await Appointment.updateMany(
            { 
                $or: [
                    { status: { $exists: false } },
                    { status: "" },
                    { status: null }
                ]
            },
            { $set: { status: 'Pending' } }
        );
        console.log(`Updated ${statusResult.modifiedCount} appointments with default status.`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

backfill();
