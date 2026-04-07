import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../src/models/appointment.js';

dotenv.config();

const debugStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const statusCounts = await Appointment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log('--- DATABASE STATUS COUNTS ---');
        console.log(statusCounts);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugStats();
